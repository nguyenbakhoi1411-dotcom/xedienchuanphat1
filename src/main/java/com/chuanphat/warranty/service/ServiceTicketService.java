package com.chuanphat.warranty.service;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.common.dto.PageRequestFactory;
import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.service.CustomerService;
import com.chuanphat.warranty.dto.AddServiceTicketItemRequest;
import com.chuanphat.warranty.dto.AssignTechnicianRequest;
import com.chuanphat.warranty.dto.CreateServiceTicketRequest;
import com.chuanphat.warranty.dto.RepairCostResponse;
import com.chuanphat.warranty.dto.ServiceProfessionalDtos;
import com.chuanphat.warranty.dto.ServiceTicketResponse;
import com.chuanphat.warranty.dto.UpdateTicketStatusRequest;
import com.chuanphat.warranty.entity.RepairQuotation;
import com.chuanphat.warranty.entity.ServiceInvoice;
import com.chuanphat.warranty.entity.ServiceTicket;
import com.chuanphat.warranty.entity.ServiceTicketItem;
import com.chuanphat.warranty.entity.ServiceTicketTimeline;
import com.chuanphat.warranty.enums.ServiceType;
import com.chuanphat.warranty.enums.ServiceTicketItemType;
import com.chuanphat.warranty.enums.ServiceTicketStatus;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.reports.ExportDocumentService;
import com.chuanphat.warranty.repository.RepairQuotationRepository;
import com.chuanphat.warranty.repository.ServiceInvoiceRepository;
import com.chuanphat.warranty.repository.ServiceTicketRepository;
import com.chuanphat.warranty.repository.ServiceTicketTimelineRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServiceTicketService {
    private final ServiceTicketRepository serviceTicketRepository;
    private final ProductSerialRepository serialRepository;
    private final BranchSecurity branchSecurity;
    private final ProductRepository productRepository;
    private final InventoryStockRepository stockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final RepairQuotationRepository quotationRepository;
    private final ServiceInvoiceRepository invoiceRepository;
    private final ServiceTicketTimelineRepository timelineRepository;
    private final ExportDocumentService exportDocumentService;
    private final AccountingService accountingService;
    private final CustomerService customerService;
    private final WarrantyService warrantyService;

    public ServiceTicketService(
            ServiceTicketRepository serviceTicketRepository,
            ProductSerialRepository serialRepository,
            BranchSecurity branchSecurity,
            ProductRepository productRepository,
            InventoryStockRepository stockRepository,
            InventoryTransactionRepository transactionRepository,
            RepairQuotationRepository quotationRepository,
            ServiceInvoiceRepository invoiceRepository,
            ServiceTicketTimelineRepository timelineRepository,
            ExportDocumentService exportDocumentService,
            AccountingService accountingService,
            CustomerService customerService,
            WarrantyService warrantyService
    ) {
        this.serviceTicketRepository = serviceTicketRepository;
        this.serialRepository = serialRepository;
        this.branchSecurity = branchSecurity;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.quotationRepository = quotationRepository;
        this.invoiceRepository = invoiceRepository;
        this.timelineRepository = timelineRepository;
        this.exportDocumentService = exportDocumentService;
        this.accountingService = accountingService;
        this.customerService = customerService;
        this.warrantyService = warrantyService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ServiceTicketResponse> list(String keyword, ServiceTicketStatus status, int page, int pageSize) {
        PageRequest pageRequest = PageRequestFactory.of(page, pageSize, "createdAt,desc", Map.of(
                "createdAt", "createdAt",
                "receivedDate", "receivedDate",
                "status", "status",
                "customerName", "customerName",
                "serialNumber", "serialNumber"
        ), "createdAt,desc");
        Long scopedBranchId = branchSecurity.scopedBranchId(null);
        String q = keyword == null ? "" : keyword.trim().toLowerCase();
        Page<ServiceTicket> source = serviceTicketRepository.search(scopedBranchId, status, q.isBlank() ? null : q, pageRequest);
        return PageResponse.from(source.map(ServiceTicketResponse::summary));
    }

    @Transactional(readOnly = true)
    public ServiceTicketResponse detail(Long ticketId) {
        return ServiceTicketResponse.from(getTicket(ticketId));
    }

    @Transactional
    public ServiceTicketResponse create(CreateServiceTicketRequest request) {
        ProductSerial serial = serialRepository.findById(request.vehicleId())
                .orElseThrow(() -> new NotFoundException("Serial not found: " + request.vehicleId()));
        branchSecurity.requireBranchAccess(serial.getBranchId());
        if (!serial.getSerialNumber().equalsIgnoreCase(request.serialNumber())) {
            throw new BusinessException("Service ticket serial does not match vehicle");
        }
        ServiceTicket ticket = new ServiceTicket();
        ticket.setVehicleId(request.vehicleId());
        ticket.setBranchId(request.branchId() == null ? serial.getBranchId() : request.branchId());
        ticket.setSerialNumber(request.serialNumber());
        ticket.setCustomerId(request.customerId());
        ticket.setCustomerName(request.customerName());
        ticket.setCustomerPhone(request.phone());
        String reportedIssue = request.customerReportedIssue() == null ? request.issueDescription() : request.customerReportedIssue();
        ticket.setIssueDescription(reportedIssue);
        ticket.setCustomerReportedIssue(reportedIssue);
        ticket.setReceivedDate(request.receivedDate() == null ? LocalDate.now() : request.receivedDate());
        ticket.setExpectedReturnDate(request.expectedReturnDate());
        ticket.setBeforeRepairImages(request.vehicleReceivedImages() == null ? request.beforeRepairImages() : request.vehicleReceivedImages());
        ticket.setFaultImages(request.faultImages());
        ticket.setAfterRepairImages(request.afterRepairImages());
        ticket.setDocumentFiles(request.documentFiles());
        boolean warrantyRepair = request.warrantyRepair() == null || request.warrantyRepair();
        ServiceType serviceType = request.serviceType() == null ? (warrantyRepair ? ServiceType.WARRANTY : ServiceType.PAID_REPAIR) : request.serviceType();
        ticket.setServiceType(serviceType);
        ticket.setWarrantyRepair(serviceType == ServiceType.WARRANTY);
        ticket.setStatus(ServiceTicketStatus.RECEIVED);
        ServiceTicket saved = serviceTicketRepository.save(ticket);
        addTimeline(saved.getId(), "Tiep nhan phieu", request.issueDescription());
        return ServiceTicketResponse.from(saved);
    }

    @Transactional
    public ServiceTicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request) {
        ServiceTicket ticket = getTicket(ticketId);
        if (isClosed(ticket)) {
            throw new BusinessException("Cannot update a closed service ticket");
        }
        if (request.status() == ServiceTicketStatus.ASSIGNED && ticket.getTechnicianUsername() == null) {
            throw new BusinessException("Assign technician before setting status to ASSIGNED");
        }
        if (!ticket.isWarrantyRepair() && (request.status() == ServiceTicketStatus.REPAIRING || request.status() == ServiceTicketStatus.COMPLETED)) {
            RepairQuotation quotation = quotationRepository.findTopByTicketIdOrderByCreatedAtDesc(ticketId)
                    .orElseThrow(() -> new BusinessException("Paid repair requires quotation approval"));
            if (!"APPROVED".equals(quotation.getStatus())) {
                throw new BusinessException("Customer must approve repair quotation before repair");
            }
        }
        ticket.setStatus(request.status());
        if (request.status() == ServiceTicketStatus.RETURNED) {
            ticket.setReturnedAt(OffsetDateTime.now());
            ticket.setActualReturnDate(LocalDate.now());
        }
        // Khi hoàn thành: ghi kế toán + cập nhật Customer 360
        if (request.status() == ServiceTicketStatus.COMPLETED) {
            recordTicketAccounting(ticket);
            if (ticket.getCustomerId() != null) {
                customerService.updateLastServiceDate(ticket.getCustomerId(), LocalDate.now());
            }
        }
        addTimeline(ticket.getId(), "Cap nhat trang thai", request.status().name());
        return ServiceTicketResponse.from(ticket);
    }

    @Transactional
    public ServiceTicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request) {
        ServiceTicket ticket = getTicket(ticketId);
        if (isClosed(ticket)) {
            throw new BusinessException("Cannot assign technician to a closed service ticket");
        }
        ticket.setTechnicianUsername(request.technicianUsername());
        if (ticket.getStatus() == ServiceTicketStatus.CREATED || ticket.getStatus() == ServiceTicketStatus.RECEIVED) {
            ticket.setStatus(ServiceTicketStatus.ASSIGNED);
        }
        addTimeline(ticket.getId(), "Gan ky thuat vien", request.technicianUsername());
        return ServiceTicketResponse.from(ticket);
    }

    @Transactional
    public ServiceTicketResponse addItem(Long ticketId, AddServiceTicketItemRequest request) {
        ServiceTicket ticket = getTicket(ticketId);
        if (isClosed(ticket)) {
            throw new BusinessException("Cannot add item to a closed service ticket");
        }
        ServiceTicketItem item = new ServiceTicketItem();
        item.setType(request.type());
        item.setName(request.name());
        item.setProductId(request.productId());
        item.setWarehouseId(request.warehouseId());
        item.setQuantity(request.quantity());
        item.setUnitPrice(request.unitPrice());
        item.setUnitCost(request.unitCost());
        item.setComponentType(request.componentType());
        item.setWarrantyCovered(Boolean.TRUE.equals(request.isWarrantyCovered()) || ticket.isWarrantyRepair());
        ticket.addItem(item);
        if (request.type() == ServiceTicketItemType.PART && request.productId() != null && request.warehouseId() != null) {
            consumeServicePart(ticket, request);
        }
        addTimeline(ticket.getId(), "Them linh kien/cong sua", request.name());
        return ServiceTicketResponse.from(ticket);
    }

    @Transactional
    public ServiceTicketResponse updateDiagnosis(Long ticketId, ServiceProfessionalDtos.DiagnosisRequest request) {
        ServiceTicket ticket = getTicket(ticketId);
        ticket.setDiagnosisNote(request.diagnosisNote());
        ticket.setPredictedCause(request.predictedCause() == null ? request.technicianDiagnosis() : request.predictedCause());
        ticket.setComponentType(request.componentType());
        if (request.warrantyRepair() != null) {
            ticket.setWarrantyRepair(request.warrantyRepair());
            ticket.setServiceType(request.warrantyRepair() ? ServiceType.WARRANTY : ServiceType.PAID_REPAIR);
        }
        if (request.componentType() != null && ticket.getServiceType() == ServiceType.WARRANTY
                && !warrantyService.isComponentCovered(ticket.getVehicleId(), request.componentType(), ticket.getReceivedDate())) {
            ticket.setWarrantyRepair(false);
            ticket.setServiceType(ServiceType.PAID_REPAIR);
            addTimeline(ticketId, "Het han bao hanh bo phan", request.componentType().name());
        }
        if (ticket.getStatus() == ServiceTicketStatus.RECEIVED || ticket.getStatus() == ServiceTicketStatus.DIAGNOSING || ticket.getStatus() == ServiceTicketStatus.CHECKING) {
            ticket.setStatus(ticket.isWarrantyRepair() ? ServiceTicketStatus.WAITING_PARTS : ServiceTicketStatus.QUOTED);
        }
        addTimeline(ticketId, "Chan doan", request.predictedCause());
        return ServiceTicketResponse.from(ticket);
    }

    @Transactional
    public ServiceProfessionalDtos.RepairQuotationResponse createQuotation(Long ticketId, ServiceProfessionalDtos.RepairQuotationRequest request) {
        ServiceTicket ticket = getTicket(ticketId);
        ticket.recalculateTotalCost();
        RepairQuotation quotation = new RepairQuotation();
        quotation.setQuotationNo("RQ-" + System.currentTimeMillis());
        quotation.setTicketId(ticketId);
        quotation.setPartsAmount(ticket.getPartsCost());
        quotation.setLaborAmount(ticket.getLaborCost());
        quotation.setTotalAmount(ticket.getTotalCost());
        quotation.setNote(request.note());
        ticket.setStatus(ServiceTicketStatus.WAITING_CUSTOMER_APPROVAL);
        addTimeline(ticketId, "Tao bao gia sua chua", quotation.getTotalAmount().toPlainString());
        return ServiceProfessionalDtos.RepairQuotationResponse.from(quotationRepository.save(quotation));
    }

    @Transactional
    public ServiceProfessionalDtos.RepairQuotationResponse approveQuotation(Long ticketId) {
        RepairQuotation quotation = quotationRepository.findTopByTicketIdOrderByCreatedAtDesc(ticketId)
                .orElseThrow(() -> new NotFoundException("Repair quotation not found for ticket " + ticketId));
        ServiceTicket ticket = getTicket(ticketId);
        quotation.setStatus("APPROVED");
        quotation.setApprovedAt(OffsetDateTime.now());
        ticket.setApprovedAt(quotation.getApprovedAt());
        ticket.setStatus(ServiceTicketStatus.WAITING_PARTS);
        addTimeline(ticketId, "Khach dong y bao gia", quotation.getQuotationNo());
        return ServiceProfessionalDtos.RepairQuotationResponse.from(quotation);
    }

    @Transactional
    public ServiceProfessionalDtos.ServiceInvoiceResponse createServiceInvoice(Long ticketId) {
        ServiceTicket ticket = getTicket(ticketId);
        if (ticket.isWarrantyRepair()) {
            throw new BusinessException("Warranty repair does not require service invoice");
        }
        ServiceInvoice invoice = invoiceRepository.findByTicketId(ticketId).orElseGet(ServiceInvoice::new);
        invoice.setTicketId(ticketId);
        invoice.setInvoiceNo(invoice.getInvoiceNo() == null ? "SI-" + System.currentTimeMillis() : invoice.getInvoiceNo());
        invoice.setAmount(ticket.getTotalCost());
        invoice.setStatus("ISSUED");
        addTimeline(ticketId, "Tao hoa don sua chua", invoice.getAmount().toPlainString());
        return ServiceProfessionalDtos.ServiceInvoiceResponse.from(invoiceRepository.save(invoice));
    }

    @Transactional
    public RepairCostResponse calculateCost(Long ticketId) {
        ServiceTicket ticket = getTicket(ticketId);
        ticket.recalculateTotalCost();
        return new RepairCostResponse(ticket.getId(), ticket.getTotalCost());
    }

    @Transactional(readOnly = true)
    public byte[] serviceTicketPdf(Long ticketId) {
        ServiceTicket ticket = getTicket(ticketId);
        ticket.recalculateTotalCost();
        return exportDocumentService.businessPdf(new ExportDocumentService.BusinessDocument(
                "Phieu tiep nhan/sua chua",
                "SC-" + ticket.getId(),
                ticket.getCreatedAt() == null ? LocalDate.now().toString() : ticket.getCreatedAt().toLocalDate().toString(),
                ticket.getCustomerName(),
                ticket.getCustomerPhone(),
                "Serial: " + ticket.getSerialNumber() + " | Trang thai: " + ticket.getStatus(),
                List.of("Hang muc", "Loai", "SL", "Don gia", "Thanh tien"),
                ticket.getItems().stream().map(item -> List.<String>of(
                        item.getName(),
                        item.getType().name(),
                        String.valueOf(item.getQuantity()),
                        item.getUnitPrice().toPlainString(),
                        item.lineTotal().toPlainString()
                )).toList(),
                ticket.getTotalCost()
        ));
    }

    @Transactional(readOnly = true)
    public List<ServiceTicketResponse> historyByVehicle(Long vehicleId) {
        ProductSerial serial = serialRepository.findById(vehicleId)
                .orElseThrow(() -> new NotFoundException("Serial not found: " + vehicleId));
        branchSecurity.requireBranchAccess(serial.getBranchId());
        return serviceTicketRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId).stream().map(ServiceTicketResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceProfessionalDtos.TimelineResponse> timeline(Long ticketId) {
        getTicket(ticketId);
        return timelineRepository.findByTicketIdOrderByEventTimeDesc(ticketId).stream().map(ServiceProfessionalDtos.TimelineResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ServiceProfessionalDtos.ServiceReportResponse report() {
        Long scopedBranchId = branchSecurity.scopedBranchId(null);
        List<ServiceTicket> tickets = serviceTicketRepository.search(scopedBranchId, null, null, PageRequest.of(0, 10_000)).getContent();
        double avgHours = tickets.stream()
                .filter(ticket -> ticket.getUpdatedAt() != null)
                .mapToLong(ticket -> ChronoUnit.HOURS.between(ticket.getCreatedAt(), ticket.getUpdatedAt()))
                .average()
                .orElse(0);
        Map<ServiceTicketStatus, Long> statusCounts = tickets.stream().collect(Collectors.groupingBy(ServiceTicket::getStatus, Collectors.counting()));
        return new ServiceProfessionalDtos.ServiceReportResponse(
                statusCounts.entrySet().stream().map(row -> new ServiceProfessionalDtos.StatusCount(row.getKey().name(), row.getValue())).toList(),
                Math.round(avgHours * 10.0) / 10.0,
                tickets.stream()
                        .collect(Collectors.groupingBy(ticket -> Objects.toString(ticket.getIssueDescription(), "UNKNOWN"), Collectors.counting()))
                        .entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .limit(10)
                        .map(row -> new ServiceProfessionalDtos.IssueCount(row.getKey(), row.getValue()))
                        .toList(),
                tickets.stream()
                        .filter(ticket -> ticket.getTechnicianUsername() != null)
                        .collect(Collectors.groupingBy(ServiceTicket::getTechnicianUsername, Collectors.counting()))
                        .entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .limit(10)
                        .map(row -> new ServiceProfessionalDtos.TechnicianCount(row.getKey(), row.getValue()))
                        .toList(),
                tickets.stream().map(ServiceTicket::getWarrantyCost).reduce(BigDecimal.ZERO, BigDecimal::add),
                tickets.stream().filter(ticket -> !ticket.isWarrantyRepair()).map(ServiceTicket::getCustomerPayAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                topFaultyModels(tickets),
                topFaultyComponents(tickets),
                topFaultySuppliers(tickets),
                warrantyCostByMonth(tickets),
                reworkRate(tickets)
        );
    }

    private ServiceTicket getTicket(Long ticketId) {
        ServiceTicket ticket = serviceTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Service ticket not found: " + ticketId));
        ProductSerial serial = serialRepository.findById(ticket.getVehicleId())
                .orElseThrow(() -> new NotFoundException("Serial not found: " + ticket.getVehicleId()));
        branchSecurity.requireBranchAccess(serial.getBranchId());
        return ticket;
    }

    /**
     * Ghi kế toán khi phiếu dịch vụ hoàn thành.
     * Idempotent — AccountingService tự kiểm tra existsBySourceNoAndType.
     */
    private void recordTicketAccounting(ServiceTicket ticket) {
        ticket.recalculateTotalCost();
        BigDecimal totalCost = ticket.getTotalCost();
        if (totalCost == null || totalCost.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        String ticketNo = "SC-" + ticket.getId();
        LocalDate completedDate = LocalDate.now();
        if (ticket.isWarrantyRepair()) {
            // Bảo hành: ghi chi phí bảo hành
            BigDecimal warrantyAmount = ticket.getWarrantyCost().compareTo(BigDecimal.ZERO) > 0 ? ticket.getWarrantyCost() : totalCost;
            accountingService.recordWarrantyCost(ticketNo, completedDate, warrantyAmount,
                    "Warranty repair cost " + ticketNo);
        } else if (ticket.getCustomerId() != null) {
            // Sửa chữa có phí: ghi doanh thu dịch vụ
            String customerName = ticket.getCustomerName() == null ? "Unknown" : ticket.getCustomerName();
            BigDecimal revenue = ticket.getCustomerPayAmount().compareTo(BigDecimal.ZERO) > 0 ? ticket.getCustomerPayAmount() : totalCost;
            accountingService.recordServiceRevenue(ticketNo, completedDate,
                    ticket.getCustomerId(), customerName, revenue,
                    "Service revenue " + ticketNo);
        }
        serialRepository.findById(ticket.getVehicleId()).ifPresent(serial -> {
            serial.setLastServiceTicketNo(ticketNo);
            serial.setLastServicedAt(completedDate);
        });
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase().contains(keyword);
    }

    private boolean isClosed(ServiceTicket ticket) {
        return ticket.getStatus() == ServiceTicketStatus.COMPLETED
                || ticket.getStatus() == ServiceTicketStatus.RETURNED
                || ticket.getStatus() == ServiceTicketStatus.CANCELLED;
    }

    private void consumeServicePart(ServiceTicket ticket, AddServiceTicketItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new NotFoundException("Product not found: " + request.productId()));
        ProductSerial serial = serialRepository.findById(ticket.getVehicleId())
                .orElseThrow(() -> new NotFoundException("Serial not found: " + ticket.getVehicleId()));
        InventoryStock stock = stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(serial.getBranchId(), request.warehouseId(), request.productId())
                .orElseThrow(() -> new BusinessException("Service stock not found for part " + request.productId()));
        if (stock.getAvailableQuantity() < request.quantity()) {
            throw new BusinessException("Not enough service stock for part " + product.getProductName());
        }
        stock.setQuantity(stock.getQuantity() - request.quantity());
        stockRepository.save(stock);

        BigDecimal unitCost = request.unitCost() == null ? product.getImportPrice() : request.unitCost();
        InventoryTransaction tx = new InventoryTransaction();
        tx.setType(InventoryTransactionType.SERVICE_USE);
        tx.setTransactionNo("SU-" + System.currentTimeMillis());
        tx.setTransactionDate(LocalDate.now());
        tx.setProduct(product);
        tx.setFromBranchId(serial.getBranchId());
        tx.setFromWarehouseId(request.warehouseId());
        tx.setQuantity(request.quantity());
        tx.setUnitCost(unitCost);
        tx.setTotalCost(unitCost.multiply(BigDecimal.valueOf(request.quantity())));
        tx.setReferenceType("SERVICE_TICKET");
        tx.setReferenceNo("SC-" + ticket.getId());
        tx.setNote("Service parts usage");
        transactionRepository.save(tx);
    }

    private void addTimeline(Long ticketId, String title, String description) {
        ServiceTicketTimeline timeline = new ServiceTicketTimeline();
        timeline.setTicketId(ticketId);
        timeline.setTitle(title);
        timeline.setDescription(description);
        timelineRepository.save(timeline);
    }

    private List<ServiceProfessionalDtos.IssueCount> topFaultyModels(List<ServiceTicket> tickets) {
        return tickets.stream()
                .map(ticket -> serialRepository.findById(ticket.getVehicleId())
                        .map(serial -> Objects.toString(serial.getProduct().getModel(), "UNKNOWN"))
                        .orElse("UNKNOWN"))
                .collect(Collectors.groupingBy(model -> model, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(row -> new ServiceProfessionalDtos.IssueCount(row.getKey(), row.getValue()))
                .toList();
    }

    private List<ServiceProfessionalDtos.IssueCount> topFaultyComponents(List<ServiceTicket> tickets) {
        return tickets.stream()
                .filter(ticket -> ticket.getComponentType() != null)
                .collect(Collectors.groupingBy(ticket -> ticket.getComponentType().name(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(row -> new ServiceProfessionalDtos.IssueCount(row.getKey(), row.getValue()))
                .toList();
    }

    private List<ServiceProfessionalDtos.IssueCount> topFaultySuppliers(List<ServiceTicket> tickets) {
        return tickets.stream()
                .map(ticket -> serialRepository.findById(ticket.getVehicleId())
                        .map(serial -> Objects.toString(serial.getSupplierId(), "UNKNOWN"))
                        .orElse("UNKNOWN"))
                .collect(Collectors.groupingBy(supplier -> supplier, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(row -> new ServiceProfessionalDtos.IssueCount(row.getKey(), row.getValue()))
                .toList();
    }

    private List<ServiceProfessionalDtos.IssueCount> warrantyCostByMonth(List<ServiceTicket> tickets) {
        return tickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> (ticket.getCreatedAt() == null ? OffsetDateTime.now() : ticket.getCreatedAt()).toLocalDate().withDayOfMonth(1).toString(),
                        Collectors.reducing(BigDecimal.ZERO, ServiceTicket::getWarrantyCost, BigDecimal::add)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(row -> new ServiceProfessionalDtos.IssueCount(row.getKey(), row.getValue().longValue()))
                .toList();
    }

    private double reworkRate(List<ServiceTicket> tickets) {
        long serialCount = tickets.stream().map(ServiceTicket::getVehicleId).distinct().count();
        if (serialCount == 0) {
            return 0;
        }
        long repeatedSerialCount = tickets.stream()
                .collect(Collectors.groupingBy(ServiceTicket::getVehicleId, Collectors.counting()))
                .values().stream()
                .filter(total -> total > 1)
                .count();
        return Math.round(repeatedSerialCount * 1000.0 / serialCount) / 10.0;
    }
}
