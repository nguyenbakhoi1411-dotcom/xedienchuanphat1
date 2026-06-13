package com.chuanphat.warranty.hr.service;

import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.repository.QuotationRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.hr.dto.HrDtos;
import com.chuanphat.warranty.hr.entity.*;
import com.chuanphat.warranty.hr.repository.*;
import com.chuanphat.warranty.repository.ServiceTicketRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HrService {
    private static final BigDecimal LATE_FINE_PER_MINUTE = new BigDecimal("1000");
    private static final BigDecimal OVERTIME_RATE = new BigDecimal("1.5");

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final WorkShiftRepository shiftRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRepository;
    private final PayrollRepository payrollRepository;
    private final CommissionRuleRepository commissionRuleRepository;
    private final KPIRepository kpiRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final QuotationRepository quotationRepository;
    private final ServiceTicketRepository serviceTicketRepository;
    private final AccountingService accountingService;
    private final BranchSecurity branchSecurity;

    public HrService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,
                     PositionRepository positionRepository, WorkShiftRepository shiftRepository,
                     AttendanceRepository attendanceRepository, LeaveRequestRepository leaveRepository,
                     PayrollRepository payrollRepository, CommissionRuleRepository commissionRuleRepository,
                     KPIRepository kpiRepository, SalesOrderRepository salesOrderRepository,
                     QuotationRepository quotationRepository, ServiceTicketRepository serviceTicketRepository,
                     AccountingService accountingService, BranchSecurity branchSecurity) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.shiftRepository = shiftRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.payrollRepository = payrollRepository;
        this.commissionRuleRepository = commissionRuleRepository;
        this.kpiRepository = kpiRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.quotationRepository = quotationRepository;
        this.serviceTicketRepository = serviceTicketRepository;
        this.accountingService = accountingService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public List<HrDtos.EmployeeResponse> employees(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        List<Employee> employees = scopedBranchId == null ? employeeRepository.findAll() : employeeRepository.findByBranchIdOrderByFullName(scopedBranchId);
        return employees.stream().map(HrDtos.EmployeeResponse::from).toList();
    }

    @Transactional
    public HrDtos.EmployeeResponse createEmployee(HrDtos.EmployeeRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        employeeRepository.findByEmployeeCodeIgnoreCase(request.employeeCode()).ifPresent(existing -> {
            throw new BusinessException("Employee code already exists");
        });
        Employee employee = new Employee();
        applyEmployee(employee, request);
        return HrDtos.EmployeeResponse.from(employeeRepository.save(employee));
    }

    @Transactional
    public HrDtos.EmployeeResponse updateEmployee(Long id, HrDtos.EmployeeRequest request) {
        Employee employee = employee(id);
        branchSecurity.requireBranchAccess(employee.getBranchId());
        branchSecurity.requireBranchAccess(request.branchId());
        applyEmployee(employee, request);
        return HrDtos.EmployeeResponse.from(employee);
    }

    @Transactional(readOnly = true)
    public List<HrDtos.DepartmentResponse> departments() {
        return departmentRepository.findByActiveTrueOrderByName().stream().map(HrDtos.DepartmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<HrDtos.PositionResponse> positions() {
        return positionRepository.findByActiveTrueOrderByName().stream().map(HrDtos.PositionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<HrDtos.WorkShiftResponse> shifts() {
        return shiftRepository.findByActiveTrueOrderByStartTime().stream().map(HrDtos.WorkShiftResponse::from).toList();
    }

    @Transactional
    public HrDtos.AttendanceResponse checkAttendance(HrDtos.AttendanceRequest request) {
        Employee employee = employee(request.employeeId());
        branchSecurity.requireBranchAccess(employee.getBranchId());
        LocalDate workDate = request.workDate() == null ? LocalDate.now() : request.workDate();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), workDate).orElseGet(Attendance::new);
        attendance.setEmployeeId(employee.getId());
        attendance.setWorkDate(workDate);
        attendance.setWorkShiftId(request.workShiftId());
        attendance.setCheckIn(request.checkIn());
        attendance.setCheckOut(request.checkOut());
        attendance.setNote(request.note());
        calculateAttendance(attendance);
        return HrDtos.AttendanceResponse.from(attendanceRepository.save(attendance));
    }

    @Transactional(readOnly = true)
    public List<HrDtos.AttendanceResponse> attendances(Long employeeId, LocalDate from, LocalDate to) {
        LocalDate start = from == null ? YearMonth.now().atDay(1) : from;
        LocalDate end = to == null ? YearMonth.now().atEndOfMonth() : to;
        List<Attendance> rows = employeeId == null
                ? attendanceRepository.findByWorkDateBetweenOrderByWorkDateDesc(start, end)
                : attendanceRepository.findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(employeeId, start, end);
        return rows.stream().map(HrDtos.AttendanceResponse::from).toList();
    }

    @Transactional
    public HrDtos.LeaveResponse createLeave(HrDtos.LeaveRequestPayload request) {
        Employee employee = employee(request.employeeId());
        branchSecurity.requireBranchAccess(employee.getBranchId());
        if (request.toDate().isBefore(request.fromDate())) {
            throw new BusinessException("toDate must be on or after fromDate");
        }
        LeaveRequest leave = new LeaveRequest();
        leave.setEmployeeId(employee.getId());
        leave.setFromDate(request.fromDate());
        leave.setToDate(request.toDate());
        leave.setLeaveType(request.leaveType() == null ? "ANNUAL" : request.leaveType());
        leave.setReason(request.reason());
        leave.setDaysCount(BigDecimal.valueOf(Duration.between(request.fromDate().atStartOfDay(), request.toDate().plusDays(1).atStartOfDay()).toDays()));
        return HrDtos.LeaveResponse.from(leaveRepository.save(leave));
    }

    @Transactional
    public HrDtos.LeaveResponse approveLeave(Long id, HrDtos.LeaveApprovalRequest request) {
        LeaveRequest leave = leaveRepository.findById(id).orElseThrow(() -> new NotFoundException("Leave not found: " + id));
        Employee employee = employee(leave.getEmployeeId());
        branchSecurity.requireBranchAccess(employee.getBranchId());
        leave.setStatus(request.status());
        leave.setApprovedBy(request.approvedBy());
        leave.setApprovedAt(OffsetDateTime.now());
        leave.setRejectedReason(request.rejectedReason());
        return HrDtos.LeaveResponse.from(leave);
    }

    @Transactional(readOnly = true)
    public List<HrDtos.LeaveResponse> leaves(String status) {
        List<LeaveRequest> leaves = status == null || status.isBlank() ? leaveRepository.findAll() : leaveRepository.findByStatusOrderByCreatedAtDesc(status);
        return leaves.stream().map(HrDtos.LeaveResponse::from).toList();
    }

    @Transactional
    public HrDtos.CommissionRuleResponse createCommissionRule(HrDtos.CommissionRuleRequest request) {
        CommissionRule rule = new CommissionRule();
        rule.setName(request.name());
        rule.setPositionId(request.positionId());
        rule.setProductCategory(request.productCategory());
        rule.setCommissionType(request.commissionType() == null ? "PERCENT" : request.commissionType());
        rule.setCommissionValue(request.commissionValue());
        rule.setMinRevenue(request.minRevenue());
        rule.setActive(request.active() == null || request.active());
        return HrDtos.CommissionRuleResponse.from(commissionRuleRepository.save(rule));
    }

    @Transactional(readOnly = true)
    public List<HrDtos.CommissionRuleResponse> commissionRules() {
        return commissionRuleRepository.findAll().stream().map(HrDtos.CommissionRuleResponse::from).toList();
    }

    @Transactional
    public HrDtos.KpiResponse calculateKpi(Long employeeId, Integer month, Integer year) {
        Employee employee = employee(employeeId);
        YearMonth ym = YearMonth.of(year, month);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();
        KPI kpi = kpiRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year).orElseGet(KPI::new);
        kpi.setEmployeeId(employeeId);
        kpi.setMonth(month);
        kpi.setYear(year);
        long quotationCount = quotationRepository.countByEmployeeIdAndQuotationDateBetween(employeeId, from, to);
        long orderCount = salesOrderRepository.countByEmployeeIdAndOrderDateBetween(employeeId, from, to);
        BigDecimal revenue = salesOrderRepository.sumRevenueByEmployee(employeeId, from, to);
        long serviceTickets = serviceTicketRepository.countByTechnicianUsernameAndCreatedAtBetween(employee.getEmployeeCode(), from.atStartOfDay().atOffset(OffsetDateTime.now().getOffset()), to.plusDays(1).atStartOfDay().atOffset(OffsetDateTime.now().getOffset()));
        kpi.setQuotationsSent((int) quotationCount);
        kpi.setOrdersClosed((int) orderCount);
        kpi.setRevenue(revenue);
        kpi.setConversionRate(quotationCount == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(orderCount * 100.0 / quotationCount).setScale(2, RoundingMode.HALF_UP));
        kpi.setServiceTicketsHandled((int) serviceTickets);
        kpi.setKpiScore(kpi.getConversionRate().min(new BigDecimal("100")));
        return HrDtos.KpiResponse.from(kpiRepository.save(kpi));
    }

    @Transactional
    public HrDtos.PayrollResponse generatePayroll(HrDtos.PayrollGenerateRequest request) {
        Employee employee = employee(request.employeeId());
        branchSecurity.requireBranchAccess(employee.getBranchId());
        Payroll payroll = payrollRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), request.month(), request.year()).orElseGet(Payroll::new);
        payroll.getItems().clear();
        payroll.setPayrollCode(payroll.getPayrollCode() == null ? "PR-" + request.year() + "-" + request.month() + "-" + employee.getEmployeeCode() : payroll.getPayrollCode());
        payroll.setEmployeeId(employee.getId());
        payroll.setBranchId(employee.getBranchId());
        payroll.setMonth(request.month());
        payroll.setYear(request.year());
        payroll.setCreatedBy(branchSecurity.currentUser().getUsername());
        BigDecimal commission = calculateCommission(employee, request.month(), request.year());
        BigDecimal lateDeduction = calculateLateDeduction(employee.getId(), request.month(), request.year());
        BigDecimal overtimePay = calculateOvertimePay(employee, request.month(), request.year());
        payroll.setBaseSalary(employee.getBaseSalary());
        payroll.setAllowance(employee.getAllowance());
        payroll.setCommission(commission);
        payroll.setKpiBonus(request.kpiBonus());
        payroll.setOvertimePay(overtimePay);
        payroll.setDeductionLate(lateDeduction);
        payroll.setAdvanceTaken(request.advanceTaken());
        payroll.setGrossSalary(employee.getBaseSalary().add(employee.getAllowance()).add(commission).add(payroll.getKpiBonus()).add(overtimePay));
        payroll.setNetSalary(payroll.getGrossSalary().subtract(lateDeduction).subtract(payroll.getAdvanceTaken()));
        addPayrollItem(payroll, "BASE_SALARY", "Luong co ban", payroll.getBaseSalary());
        addPayrollItem(payroll, "ALLOWANCE", "Phu cap", payroll.getAllowance());
        addPayrollItem(payroll, "COMMISSION", "Hoa hong ban hang", commission);
        addPayrollItem(payroll, "KPI_BONUS", "Thuong KPI", payroll.getKpiBonus());
        addPayrollItem(payroll, "OVERTIME", "Tang ca", overtimePay);
        addPayrollItem(payroll, "LATE_FINE", "Phat di muon/ve som", lateDeduction.negate());
        addPayrollItem(payroll, "ADVANCE", "Tam ung", payroll.getAdvanceTaken().negate());
        Payroll saved = payrollRepository.save(payroll);
        if (request.recordAccounting()) {
            accountingService.recordSalaryExpense(saved.getPayrollCode(), LocalDate.now(), saved.getNetSalary(), "Salary expense " + saved.getPayrollCode());
        }
        return HrDtos.PayrollResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<HrDtos.PayrollResponse> payrolls(Integer month, Integer year) {
        return payrollRepository.findByMonthAndYearOrderByEmployeeId(month, year).stream().map(HrDtos.PayrollResponse::from).toList();
    }

    private void applyEmployee(Employee employee, HrDtos.EmployeeRequest request) {
        employee.setEmployeeCode(request.employeeCode());
        employee.setFullName(request.fullName());
        employee.setPhone(request.phone());
        employee.setEmail(request.email());
        employee.setBranchId(request.branchId());
        employee.setDepartmentId(request.departmentId());
        employee.setPositionId(request.positionId());
        employee.setHireDate(request.hireDate() == null ? LocalDate.now() : request.hireDate());
        employee.setStatus(request.status() == null ? "ACTIVE" : request.status());
        employee.setBaseSalary(request.baseSalary());
        employee.setAllowance(request.allowance());
        employee.setUserId(request.userId());
    }

    private void calculateAttendance(Attendance attendance) {
        if (attendance.getWorkShiftId() == null || attendance.getCheckIn() == null || attendance.getCheckOut() == null) {
            attendance.setStatus(attendance.getCheckIn() == null ? "ABSENT" : "PRESENT");
            return;
        }
        WorkShift shift = shiftRepository.findById(attendance.getWorkShiftId()).orElseThrow(() -> new NotFoundException("Shift not found"));
        OffsetDateTime scheduledIn = attendance.getCheckIn().withHour(shift.getStartTime().getHour()).withMinute(shift.getStartTime().getMinute()).withSecond(0).withNano(0);
        OffsetDateTime scheduledOut = attendance.getCheckOut().withHour(shift.getEndTime().getHour()).withMinute(shift.getEndTime().getMinute()).withSecond(0).withNano(0);
        int late = Math.max(0, (int) Duration.between(scheduledIn, attendance.getCheckIn()).toMinutes());
        int early = Math.max(0, (int) Duration.between(attendance.getCheckOut(), scheduledOut).toMinutes());
        BigDecimal overtime = BigDecimal.valueOf(Math.max(0, Duration.between(scheduledOut, attendance.getCheckOut()).toMinutes())).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        attendance.setLateMinutes(late);
        attendance.setEarlyLeaveMinutes(early);
        attendance.setOvertimeHours(overtime);
        attendance.setStatus(late > 0 ? "LATE" : "PRESENT");
    }

    private BigDecimal calculateCommission(Employee employee, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        BigDecimal revenue = salesOrderRepository.sumRevenueByEmployee(employee.getId(), ym.atDay(1), ym.atEndOfMonth());
        return commissionRuleRepository.findApplicable(employee.getPositionId(), revenue).stream().findFirst()
                .map(rule -> "FIXED".equals(rule.getCommissionType())
                        ? rule.getCommissionValue()
                        : revenue.multiply(rule.getCommissionValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal calculateLateDeduction(Long employeeId, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        int minutes = attendanceRepository.findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(employeeId, ym.atDay(1), ym.atEndOfMonth()).stream()
                .mapToInt(a -> a.getLateMinutes() + a.getEarlyLeaveMinutes())
                .sum();
        return LATE_FINE_PER_MINUTE.multiply(BigDecimal.valueOf(minutes));
    }

    private BigDecimal calculateOvertimePay(Employee employee, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        BigDecimal hours = attendanceRepository.findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(employee.getId(), ym.atDay(1), ym.atEndOfMonth()).stream()
                .map(Attendance::getOvertimeHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal hourly = employee.getBaseSalary().divide(BigDecimal.valueOf(26 * 8), 2, RoundingMode.HALF_UP);
        return hourly.multiply(hours).multiply(OVERTIME_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    private void addPayrollItem(Payroll payroll, String type, String description, BigDecimal amount) {
        PayrollItem item = new PayrollItem();
        item.setItemType(type);
        item.setDescription(description);
        item.setAmount(amount);
        payroll.addItem(item);
    }

    private Employee employee(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new NotFoundException("Employee not found: " + id));
    }
}
