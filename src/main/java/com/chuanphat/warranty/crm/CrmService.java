package com.chuanphat.warranty.crm;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.crm.dto.CrmDtos;
import com.chuanphat.warranty.crm.entity.*;
import com.chuanphat.warranty.crm.enums.*;
import com.chuanphat.warranty.crm.repository.*;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.repository.ServiceTicketRepository;
import com.chuanphat.warranty.repository.WarrantyRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CrmService {
    private final CustomerRepository customerRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SalesPaymentRepository salesPaymentRepository;
    private final WarrantyRepository warrantyRepository;
    private final ServiceTicketRepository serviceTicketRepository;
    private final LeadRepository leadRepository;
    private final SalesOpportunityRepository opportunityRepository;
    private final CrmCareTaskRepository taskRepository;
    private final CustomerCareNoteRepository noteRepository;
    private final ProductSerialRepository serialRepository;
    private final QuotationRepository quotationRepository;
    private final DepositRepository depositRepository;
    private final CustomerGroupRepository customerGroupRepository;
    private final CrmAlertService alertService;
    private final BigDecimal vipThreshold;

    public CrmService(
            CustomerRepository customerRepository,
            SalesOrderRepository salesOrderRepository,
            SalesPaymentRepository salesPaymentRepository,
            WarrantyRepository warrantyRepository,
            ServiceTicketRepository serviceTicketRepository,
            LeadRepository leadRepository,
            SalesOpportunityRepository opportunityRepository,
            CrmCareTaskRepository taskRepository,
            CustomerCareNoteRepository noteRepository,
            ProductSerialRepository serialRepository,
            QuotationRepository quotationRepository,
            DepositRepository depositRepository,
            CustomerGroupRepository customerGroupRepository,
            CrmAlertService alertService,
            @Value("${app.crm.vip-threshold:30000000}") BigDecimal vipThreshold
    ) {
        this.customerRepository  = customerRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.salesPaymentRepository = salesPaymentRepository;
        this.warrantyRepository  = warrantyRepository;
        this.serviceTicketRepository = serviceTicketRepository;
        this.leadRepository      = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.taskRepository      = taskRepository;
        this.noteRepository      = noteRepository;
        this.serialRepository    = serialRepository;
        this.quotationRepository = quotationRepository;
        this.depositRepository   = depositRepository;
        this.customerGroupRepository = customerGroupRepository;
        this.alertService        = alertService;
        this.vipThreshold        = vipThreshold;
    }

    // ── LEADS ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<CrmDtos.LeadResponse> listLeads(String keyword, LeadStatus status, int page, int pageSize) {
        if (status != null) {
            return PageResponse.from(leadRepository.findByStatus(status, PageRequest.of(page, pageSize))
                    .map(CrmDtos.LeadResponse::from));
        }
        String search = keyword == null ? "" : keyword;
        return PageResponse.from(leadRepository
                .findByLeadNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(search, search, PageRequest.of(page, pageSize))
                .map(CrmDtos.LeadResponse::from));
    }

    @Transactional
    public CrmDtos.LeadResponse createLead(CrmDtos.LeadRequest request) {
        Lead lead = new Lead();
        applyLead(lead, request);
        return CrmDtos.LeadResponse.from(leadRepository.save(lead));
    }

    @Transactional
    public CrmDtos.LeadResponse updateLead(Long id, CrmDtos.LeadRequest request) {
        Lead lead = getLead(id);
        applyLead(lead, request);
        return CrmDtos.LeadResponse.from(leadRepository.save(lead));
    }

    /**
     * Advance lead tới trạng thái kế tiếp trong pipeline.
     * Pipeline: NEW → CONTACTED → CONSULTING → QUOTED → DEPOSITED → WON
     */
    @Transactional
    public CrmDtos.LeadResponse advanceLead(Long id, LeadStatus targetStatus, String reason) {
        Lead lead = getLead(id);
        validateLeadTransition(lead.getStatus(), targetStatus);
        lead.setStatus(targetStatus);
        if (targetStatus == LeadStatus.LOST) {
            lead.setLostReason(reason);
        }
        return CrmDtos.LeadResponse.from(leadRepository.save(lead));
    }

    /** Lead pipeline: danh sách theo stage (kanban view) */
    @Transactional(readOnly = true)
    public Map<LeadStatus, List<CrmDtos.LeadResponse>> getPipeline() {
        Map<LeadStatus, List<CrmDtos.LeadResponse>> pipeline = new LinkedHashMap<>();
        for (LeadStatus status : List.of(
                LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.CONSULTING,
                LeadStatus.QUOTED, LeadStatus.DEPOSITED)) {
            pipeline.put(status, leadRepository.findByStatus(status).stream()
                    .map(CrmDtos.LeadResponse::from).toList());
        }
        return pipeline;
    }

    @Transactional
    public CrmDtos.Customer360Response convertLeadToCustomer(Long id, CrmDtos.ConvertLeadRequest request) {
        Lead lead = getLead(id);
        if (lead.getConvertedCustomerId() != null) {
            return customer360(lead.getConvertedCustomerId());
        }
        Customer customer = new Customer();
        customer.setPhone(lead.getPhone());
        customer.setFullName(lead.getLeadName());
        customer.setEmail(request.email() != null ? request.email() : lead.getEmail());
        customer.setAddress(request.address());
        customer.setSource(lead.getSource().name());
        customer.setBranchId(request.branchId() == null ? (lead.getBranchId() != null ? lead.getBranchId() : 1L) : request.branchId());
        customer.setAssignedTo(request.assignedTo() == null ? lead.getAssignedTo() : request.assignedTo());
        customer.setTier(CustomerTier.NEW);
        customer.setRank(CustomerRank.NEW);
        // Auto-generate customerCode
        long count = customerRepository.count() + 1;
        customer.setCustomerCode("KH-" + String.format("%06d", count));
        Customer saved = customerRepository.save(customer);
        lead.setConvertedCustomerId(saved.getId());
        lead.setConvertedAt(OffsetDateTime.now());
        lead.setStatus(LeadStatus.CONVERTED);
        leadRepository.save(lead);
        return customer360(saved.getId());
    }

    @Transactional
    public CrmDtos.OpportunityResponse convertLeadToOpportunity(Long id, CrmDtos.OpportunityRequest request) {
        Lead lead = getLead(id);
        CrmDtos.OpportunityRequest enriched = new CrmDtos.OpportunityRequest(
                request.customerId(), lead.getId(), request.expectedValue(),
                request.expectedCloseDate(), request.stage(), request.probability(),
                request.assignedTo() == null ? lead.getAssignedTo() : request.assignedTo()
        );
        return createOpportunity(enriched);
    }

    // ── CUSTOMERS ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<CrmDtos.CustomerSummary> listCustomers(String keyword, Long branchId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        String kw = keyword == null ? "" : keyword;
        var pageResult = branchId != null
                ? customerRepository.findByStatusNotAndBranchIdAndFullNameContainingIgnoreCase(RecordStatus.DELETED, branchId, kw, pageable)
                : customerRepository.findByStatusNotAndFullNameContainingIgnoreCase(RecordStatus.DELETED, kw, pageable);
        return PageResponse.from(pageResult.map(CrmDtos.CustomerSummary::from));
    }

    // ── CUSTOMER 360 ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CrmDtos.Customer360Response customer360(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));

        // Purchases
        List<SalesOrder> purchases = salesOrderRepository.findByCustomerIdOrderByOrderDateDesc(customerId);
        BigDecimal totalSpent = purchases.stream().map(SalesOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paid = purchases.stream().map(SalesOrder::getPaidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal debt = totalSpent.subtract(paid).max(BigDecimal.ZERO);

        // Xe đã mua (ProductSerial)
        List<ProductSerial> serials = serialRepository.findByCurrentCustomerIdOrderBySoldDateDesc(customerId);

        // Báo giá
        List<Quotation> quotations = quotationRepository.findByCustomerIdOrderByQuotationDateDesc(customerId);

        // Đặt cọc
        List<Deposit> deposits = depositRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(customerId);

        // Warranty & Repair
        var warranties = warrantyRepository.findByCustomerIdOrderByEndDateAsc(customerId);
        var repairs = serviceTicketRepository.findByCustomerNameContainingIgnoreCaseOrderByCreatedAtDesc(customer.getFullName());

        // CRM
        var notes = noteRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        var tasks = taskRepository.findByCustomerIdOrderByDueDateAscCreatedAtDesc(customerId);
        var usedVouchers = purchases.stream().map(SalesOrder::getVoucherCode)
                .filter(Objects::nonNull).filter(c -> !c.isBlank()).distinct().toList();
        var opportunities = opportunityRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);

        // Alerts
        var alerts = alertService.getAlertsByCustomer(customerId);

        // Timeline
        var timeline = buildTimeline(customerId, purchases, serials, quotations, deposits,
                warranties, repairs, notes, tasks);

        return CrmDtos.Customer360Response.of(
                customer, totalSpent, debt, debt.compareTo(BigDecimal.ZERO) > 0,
                purchases.stream().map(CrmDtos.PurchaseHistoryResponse::from).toList(),
                salesPaymentRepository.findByOrder_CustomerIdOrderByPaymentDateDescIdDesc(customerId)
                        .stream().map(CrmDtos.PaymentHistoryResponse::from).toList(),
                warranties.stream().map(CrmDtos.WarrantyHistoryResponse::from).toList(),
                repairs.stream().map(CrmDtos.RepairHistoryResponse::from).toList(),
                notes.stream().map(CrmDtos.CareNoteResponse::from).toList(),
                tasks.stream().map(CrmDtos.CareTaskResponse::from).toList(),
                usedVouchers,
                opportunities.stream().map(CrmDtos.OpportunityResponse::from).toList(),
                serials.stream().map(CrmDtos.VehicleSerialResponse::from).toList(),
                quotations.stream().map(CrmDtos.QuotationSummaryResponse::from).toList(),
                deposits.stream().map(CrmDtos.DepositSummaryResponse::from).toList(),
                alerts.stream().map(CrmDtos.AlertResponse::from).toList(),
                timeline
        );
    }

    // ── TIMELINE BUILDER ───────────────────────────────────────────

    private List<CrmDtos.TimelineEvent> buildTimeline(
            Long customerId,
            List<SalesOrder> purchases,
            List<ProductSerial> serials,
            List<Quotation> quotations,
            List<Deposit> deposits,
            List<?> warranties, List<?> repairs,
            List<?> notes, List<?> tasks) {

        List<CrmDtos.TimelineEvent> events = new ArrayList<>();

        // Purchases
        for (SalesOrder o : purchases) {
            events.add(new CrmDtos.TimelineEvent("ORDER", "Đơn hàng " + o.getOrderNo(),
                    String.format("Tổng %,.0f đ — %s", o.getTotalAmount(), o.getPaymentStatus()),
                    o.getOrderDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset()), o.getId()));
        }

        // Quotations
        for (Quotation q : quotations) {
            events.add(new CrmDtos.TimelineEvent("QUOTATION", "Báo giá " + q.getQuotationNo(),
                    String.format("Tổng %,.0f đ — %s", q.getTotalAmount(), q.getStatus()),
                    q.getCreatedAt(), q.getId()));
        }

        // Deposits
        for (Deposit d : deposits) {
            events.add(new CrmDtos.TimelineEvent("DEPOSIT", "Đặt cọc",
                    String.format("Số tiền %,.0f đ", d.getAmount()),
                    d.getCreatedAt(), d.getId()));
        }


        // Serials sold
        for (ProductSerial s : serials) {
            if (s.getSoldDate() != null) {
                events.add(new CrmDtos.TimelineEvent("VEHICLE_SOLD", "Bàn giao xe " + (s.getFrameNumber() != null ? s.getFrameNumber() : s.getSerialNumber()),
                        "Serial: " + s.getSerialNumber(),
                        s.getSoldDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset()), s.getId()));
            }
        }

        // Warranties (from Warranty entity)
        warranties.forEach(w -> {
            if (w instanceof com.chuanphat.warranty.entity.Warranty warranty) {
                events.add(new CrmDtos.TimelineEvent("WARRANTY", "Kích hoạt bảo hành " + warranty.getSerialNumber(),
                        "Hết hạn: " + warranty.getEndDate(),
                        warranty.getStartDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset()), warranty.getId()));
            }
        });

        // Repairs
        repairs.forEach(r -> {
            if (r instanceof com.chuanphat.warranty.entity.ServiceTicket ticket) {
                events.add(new CrmDtos.TimelineEvent("REPAIR", "Sửa chữa: " + ticket.getIssueDescription(),
                        "Trạng thái: " + ticket.getStatus(), ticket.getCreatedAt(), ticket.getId()));
            }
        });

        // Care notes
        notes.forEach(n -> {
            if (n instanceof com.chuanphat.warranty.crm.entity.CustomerCareNote note) {
                events.add(new CrmDtos.TimelineEvent("CARE_NOTE", "Ghi chú chăm sóc",
                        note.getContent(), note.getCreatedAt(), note.getId()));
            }
        });

        // Sort DESC by time
        events.sort(Comparator.comparing(CrmDtos.TimelineEvent::occurredAt).reversed());
        return events;
    }

    // ── OPPORTUNITIES ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CrmDtos.OpportunityResponse> listOpportunities(OpportunityStage stage) {
        List<SalesOpportunity> opps = stage == null
                ? opportunityRepository.findAll()
                : opportunityRepository.findByStageOrderByExpectedCloseDateAsc(stage);
        return opps.stream().map(CrmDtos.OpportunityResponse::from).toList();
    }

    @Transactional
    public CrmDtos.OpportunityResponse createOpportunity(CrmDtos.OpportunityRequest request) {
        SalesOpportunity opp = new SalesOpportunity();
        applyOpportunity(opp, request);
        return CrmDtos.OpportunityResponse.from(opportunityRepository.save(opp));
    }

    @Transactional
    public CrmDtos.OpportunityResponse updateOpportunity(Long id, CrmDtos.OpportunityRequest request) {
        SalesOpportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Opportunity not found: " + id));
        applyOpportunity(opp, request);
        return CrmDtos.OpportunityResponse.from(opportunityRepository.save(opp));
    }

    // ── TASKS ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<CrmDtos.CareTaskResponse> listTasks(CrmTaskStatus status, int page, int pageSize) {
        if (status == null) {
            return PageResponse.from(taskRepository.findAll(PageRequest.of(page, pageSize)).map(CrmDtos.CareTaskResponse::from));
        }
        return PageResponse.from(taskRepository.findByStatus(status, PageRequest.of(page, pageSize)).map(CrmDtos.CareTaskResponse::from));
    }

    @Transactional
    public CrmDtos.CareTaskResponse createTask(CrmDtos.CareTaskRequest request) {
        CrmCareTask task = new CrmCareTask();
        applyTask(task, request);
        return CrmDtos.CareTaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public CrmDtos.CareTaskResponse updateTaskStatus(Long id, CrmDtos.TaskStatusRequest request) {
        CrmCareTask task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("CRM task not found: " + id));
        task.setStatus(request.status());
        return CrmDtos.CareTaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public CrmDtos.CareNoteResponse addCustomerNote(Long customerId, CrmDtos.CareNoteRequest request) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));
        CustomerCareNote note = new CustomerCareNote();
        note.setCustomerId(customerId);
        note.setContent(request.content());
        note.setCreatedBy(request.createdBy() == null || request.createdBy().isBlank() ? "system" : request.createdBy());
        // Cập nhật lastCareDate trên Customer
        customerRepository.findById(customerId).ifPresent(c -> {
            c.setLastCareDate(LocalDate.now());
            customerRepository.save(c);
        });
        return CrmDtos.CareNoteResponse.from(noteRepository.save(note));
    }

    // ── CUSTOMER GROUPS ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CustomerGroup> listCustomerGroups() {
        return customerGroupRepository.findByStatus("ACTIVE");
    }

    // ── ALERTS ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CrmDtos.AlertResponse> getAlerts(int page, int size) {
        return alertService.getActiveAlerts(page, size).stream().map(CrmDtos.AlertResponse::from).toList();
    }

    @Transactional
    public void dismissAlert(Long alertId, String by) {
        alertService.dismiss(alertId, by != null ? by : "SYSTEM");
    }

    // ── REPORTS ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CrmDtos.CrmReportResponse reports() {
        Map<Long, Customer> customers = customerRepository.findAll().stream()
                .collect(Collectors.toMap(Customer::getId, c -> c));
        List<SalesOrder> orders = salesOrderRepository.findAll();
        Map<Long, BigDecimal> spentByCustomer = orders.stream().collect(Collectors.groupingBy(
                SalesOrder::getCustomerId,
                Collectors.reducing(BigDecimal.ZERO, SalesOrder::getTotalAmount, BigDecimal::add)
        ));
        Map<String, BigDecimal> revenueBySource = new LinkedHashMap<>();
        for (SalesOrder order : orders) {
            Customer customer = customers.get(order.getCustomerId());
            String source = customer == null || customer.getSource() == null ? "UNKNOWN" : customer.getSource();
            revenueBySource.merge(source, order.getTotalAmount(), BigDecimal::add);
        }

        List<CrmDtos.SourceMetricResponse> sourceMetrics = buildSourceMetrics(revenueBySource);
        long totalLeads = leadRepository.count();
        long convertedLeads = leadRepository.countByStatus(LeadStatus.CONVERTED);
        double conversionRate = totalLeads == 0 ? 0 :
                BigDecimal.valueOf(convertedLeads * 100.0 / totalLeads).setScale(2, RoundingMode.HALF_UP).doubleValue();

        OffsetDateTime now = OffsetDateTime.now();
        Map<Long, OffsetDateTime> lastCare = new HashMap<>();
        noteRepository.lastCareDates().forEach(row -> lastCare.put(row.getCustomerId(), row.getLastCareAt()));
        taskRepository.lastCareDates().forEach(row ->
                lastCare.merge(row.getCustomerId(), row.getLastCareAt(), (a, b) -> a.isAfter(b) ? a : b));

        return new CrmDtos.CrmReportResponse(
                newCustomersByMonth(), sourceMetrics, conversionRate, sourceMetrics,
                customers.values().stream()
                        .map(c -> new CrmDtos.TopCustomerResponse(c.getId(), c.getFullName(), c.getPhone(),
                                spentByCustomer.getOrDefault(c.getId(), BigDecimal.ZERO), c.getTier()))
                        .sorted(Comparator.comparing(CrmDtos.TopCustomerResponse::totalSpent).reversed())
                        .limit(10).toList(),
                customers.values().stream()
                        .map(c -> {
                            OffsetDateTime last = lastCare.get(c.getId());
                            long days = last == null ? ChronoUnit.DAYS.between(c.getCreatedAt(), now)
                                    : ChronoUnit.DAYS.between(last, now);
                            return new CrmDtos.StaleCustomerResponse(c.getId(), c.getFullName(), c.getPhone(), last, days);
                        })
                        .filter(row -> row.daysWithoutCare() >= 30)
                        .sorted(Comparator.comparing(CrmDtos.StaleCustomerResponse::daysWithoutCare).reversed())
                        .limit(20).toList(),
                taskRepository.countByStatusAndDueDateBefore(CrmTaskStatus.TODO, LocalDate.now())
        );
    }

    @Transactional
    public void refreshCustomerSegments() {
        for (Customer customer : customerRepository.findAll()) {
            List<SalesOrder> orders = salesOrderRepository.findByCustomerIdOrderByOrderDateDesc(customer.getId());
            BigDecimal totalSpent = orders.stream().map(SalesOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal debt = totalSpent.subtract(orders.stream().map(SalesOrder::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)).max(BigDecimal.ZERO);

            if (debt.compareTo(BigDecimal.ZERO) > 0) {
                customer.setTier(CustomerTier.HIGH_RISK_DEBT);
                customer.setRank(CustomerRank.NORMAL);
            } else if (totalSpent.compareTo(vipThreshold) >= 0 && customer.getTier() != CustomerTier.WHOLESALE) {
                customer.setTier(CustomerTier.VIP);
                customer.setRank(CustomerRank.VIP);
            } else if (customer.getTier() == CustomerTier.NEW && totalSpent.compareTo(BigDecimal.ZERO) > 0) {
                customer.setTier(CustomerTier.REGULAR);
                customer.setRank(CustomerRank.NORMAL);
            }
            // Check inactive
            if (customer.getLastPurchaseDate() != null &&
                    ChronoUnit.DAYS.between(customer.getLastPurchaseDate(), LocalDate.now()) > 180) {
                customer.setRank(CustomerRank.INACTIVE);
            }
            customer.setTotalDebt(debt);
            customer.setLifetimeValue(totalSpent);
            customerRepository.save(customer);
        }
    }

    // ── PRIVATE HELPERS ────────────────────────────────────────────

    private void validateLeadTransition(LeadStatus current, LeadStatus target) {
        // Cho phép mọi chuyển tiếp hợp lệ — chỉ block terminal states
        if (current == LeadStatus.WON || current == LeadStatus.LOST || current == LeadStatus.CONVERTED) {
            throw new BusinessException("Không thể chuyển lead từ trạng thái kết thúc: " + current);
        }
        if (target == LeadStatus.NEW) {
            throw new BusinessException("Không thể quay về trạng thái NEW");
        }
    }

    private Lead getLead(Long id) {
        return leadRepository.findById(id).orElseThrow(() -> new NotFoundException("Lead not found: " + id));
    }

    private void applyLead(Lead lead, CrmDtos.LeadRequest request) {
        lead.setLeadName(request.leadName());
        lead.setPhone(request.phone());
        lead.setEmail(request.email());
        lead.setSource(request.source());
        lead.setInterestedProduct(request.interestedProduct());
        lead.setAssignedTo(request.assignedTo());
        lead.setBranchId(request.branchId());
        lead.setNextFollowUpDate(request.nextFollowUpDate());
        lead.setExpectedValue(request.expectedValue());
        lead.setStatus(request.status() == null ? LeadStatus.NEW : request.status());
        lead.setLostReason(request.lostReason());
        lead.setNote(request.note());
    }

    private void applyOpportunity(SalesOpportunity opp, CrmDtos.OpportunityRequest request) {
        if (request.customerId() == null && request.leadId() == null) {
            throw new BusinessException("Opportunity requires customerId or leadId");
        }
        opp.setCustomerId(request.customerId());
        opp.setLeadId(request.leadId());
        opp.setExpectedValue(request.expectedValue());
        opp.setExpectedCloseDate(request.expectedCloseDate());
        opp.setStage(request.stage() == null ? OpportunityStage.NEW : request.stage());
        opp.setProbability(request.probability() == null ? defaultProbability(opp.getStage()) : request.probability());
        opp.setAssignedTo(request.assignedTo());
    }

    private int defaultProbability(OpportunityStage stage) {
        return switch (stage) {
            case NEW -> 10;
            case CONSULTING -> 25;
            case QUOTED -> 45;
            case NEGOTIATING -> 70;
            case WON -> 100;
            case LOST -> 0;
        };
    }

    private void applyTask(CrmCareTask task, CrmDtos.CareTaskRequest request) {
        if (request.customerId() == null && request.leadId() == null) {
            throw new BusinessException("CRM task requires customerId or leadId");
        }
        task.setCustomerId(request.customerId());
        task.setLeadId(request.leadId());
        task.setTitle(request.title());
        task.setContent(request.content());
        task.setType(request.type() == null ? CrmTaskType.CARE : request.type());
        task.setStatus(request.status() == null ? CrmTaskStatus.TODO : request.status());
        task.setDueDate(request.dueDate());
        task.setAssignedTo(request.assignedTo());
    }

    private List<CrmDtos.MonthlyNewCustomersResponse> newCustomersByMonth() {
        YearMonth current = YearMonth.now();
        return java.util.stream.IntStream.rangeClosed(0, 5)
                .mapToObj(i -> current.minusMonths(5 - i))
                .map(month -> new CrmDtos.MonthlyNewCustomersResponse(
                        month.toString(),
                        customerRepository.countByCreatedAtBetween(
                                month.atDay(1).atStartOfDay().atOffset(OffsetDateTime.now().getOffset()),
                                month.plusMonths(1).atDay(1).atStartOfDay().atOffset(OffsetDateTime.now().getOffset()))
                ))
                .toList();
    }

    private List<CrmDtos.SourceMetricResponse> buildSourceMetrics(Map<String, BigDecimal> revenueBySource) {
        Map<String, Long> leadsBySource = leadRepository.countBySource().stream()
                .collect(Collectors.toMap(row -> row.getSource().name(), LeadRepository.SourceCountRow::getTotal));
        Map<String, Long> customersBySource = customerRepository.countCustomersBySource(RecordStatus.DELETED).stream()
                .collect(Collectors.toMap(row -> row.getSource() == null ? "UNKNOWN" : row.getSource(),
                        CustomerRepository.CustomerSourceCountRow::getTotal));
        Set<String> sources = new TreeSet<>();
        sources.addAll(leadsBySource.keySet());
        sources.addAll(customersBySource.keySet());
        sources.addAll(revenueBySource.keySet());
        return sources.stream()
                .map(source -> new CrmDtos.SourceMetricResponse(
                        source,
                        leadsBySource.getOrDefault(source, 0L),
                        customersBySource.getOrDefault(source, 0L),
                        revenueBySource.getOrDefault(source, BigDecimal.ZERO)
                ))
                .toList();
    }
}
