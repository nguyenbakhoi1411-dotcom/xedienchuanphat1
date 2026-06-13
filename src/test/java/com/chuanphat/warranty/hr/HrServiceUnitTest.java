package com.chuanphat.warranty.hr;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.repository.QuotationRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.hr.dto.HrDtos;
import com.chuanphat.warranty.hr.entity.*;
import com.chuanphat.warranty.hr.repository.*;
import com.chuanphat.warranty.hr.service.HrService;
import com.chuanphat.warranty.repository.ServiceTicketRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class HrServiceUnitTest {
    private EmployeeRepository employees;
    private WorkShiftRepository shifts;
    private AttendanceRepository attendances;
    private PayrollRepository payrolls;
    private CommissionRuleRepository rules;
    private SalesOrderRepository salesOrders;
    private HrService service;

    @BeforeEach
    void setUp() {
        employees = mock(EmployeeRepository.class);
        DepartmentRepository departments = mock(DepartmentRepository.class);
        PositionRepository positions = mock(PositionRepository.class);
        shifts = mock(WorkShiftRepository.class);
        attendances = mock(AttendanceRepository.class);
        LeaveRequestRepository leaves = mock(LeaveRequestRepository.class);
        payrolls = mock(PayrollRepository.class);
        rules = mock(CommissionRuleRepository.class);
        KPIRepository kpis = mock(KPIRepository.class);
        salesOrders = mock(SalesOrderRepository.class);
        QuotationRepository quotations = mock(QuotationRepository.class);
        ServiceTicketRepository serviceTickets = mock(ServiceTicketRepository.class);
        AccountingService accounting = mock(AccountingService.class);
        BranchSecurity branchSecurity = mock(BranchSecurity.class);
        AppUser user = new AppUser();
        user.setUsername("hr.manager");
        when(branchSecurity.currentUser()).thenReturn(user);
        doNothing().when(branchSecurity).requireBranchAccess(any());
        service = new HrService(employees, departments, positions, shifts, attendances, leaves, payrolls, rules, kpis, salesOrders, quotations, serviceTickets, accounting, branchSecurity);
    }

    @Test
    void employeeIsAttachedToBranch() {
        when(employees.findByEmployeeCodeIgnoreCase("E001")).thenReturn(Optional.empty());
        when(employees.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HrDtos.EmployeeResponse response = service.createEmployee(new HrDtos.EmployeeRequest(
                "E001", "Nguyen Van HR", "0900000001", "hr@example.com", 2L,
                null, null, LocalDate.now(), "ACTIVE", new BigDecimal("10000000"), new BigDecimal("500000"), null
        ));

        assertThat(response.branchId()).isEqualTo(2L);
        assertThat(response.baseSalary()).isEqualByComparingTo("10000000");
    }

    @Test
    void attendanceCalculatesLateEarlyLeaveAndOvertime() {
        Employee employee = employee(1L);
        WorkShift shift = shift(10L);
        when(employees.findById(1L)).thenReturn(Optional.of(employee));
        when(shifts.findById(10L)).thenReturn(Optional.of(shift));
        when(attendances.findByEmployeeIdAndWorkDate(1L, LocalDate.of(2026, 6, 12))).thenReturn(Optional.empty());
        when(attendances.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HrDtos.AttendanceResponse response = service.checkAttendance(new HrDtos.AttendanceRequest(
                1L,
                LocalDate.of(2026, 6, 12),
                10L,
                OffsetDateTime.parse("2026-06-12T08:15:00+07:00"),
                OffsetDateTime.parse("2026-06-12T18:30:00+07:00"),
                null
        ));

        assertThat(response.lateMinutes()).isEqualTo(15);
        assertThat(response.earlyLeaveMinutes()).isZero();
        assertThat(response.overtimeHours()).isEqualByComparingTo("1.50");
        assertThat(response.status()).isEqualTo("LATE");
    }

    @Test
    void payrollCalculatesBaseSalaryAndSalesCommission() {
        Employee employee = employee(1L);
        CommissionRule rule = new CommissionRule();
        rule.setName("Sales 2%");
        rule.setCommissionType("PERCENT");
        rule.setCommissionValue(new BigDecimal("2"));
        when(employees.findById(1L)).thenReturn(Optional.of(employee));
        when(payrolls.findByEmployeeIdAndMonthAndYear(1L, 6, 2026)).thenReturn(Optional.empty());
        when(salesOrders.sumRevenueByEmployee(eq(1L), any(), any())).thenReturn(new BigDecimal("200000000"));
        when(rules.findApplicable(eq(10L), any())).thenReturn(List.of(rule));
        when(attendances.findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(eq(1L), any(), any())).thenReturn(List.of());
        when(payrolls.save(any(Payroll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HrDtos.PayrollResponse response = service.generatePayroll(new HrDtos.PayrollGenerateRequest(1L, 6, 2026, BigDecimal.ZERO, BigDecimal.ZERO, false));

        assertThat(response.baseSalary()).isEqualByComparingTo("10000000");
        assertThat(response.allowance()).isEqualByComparingTo("500000");
        assertThat(response.commission()).isEqualByComparingTo("4000000.00");
        assertThat(response.netSalary()).isEqualByComparingTo("14500000.00");
    }

    private Employee employee(Long id) {
        Employee employee = new Employee();
        ReflectionTestUtils.setField(employee, "id", id);
        employee.setEmployeeCode("E001");
        employee.setFullName("Nguyen Van HR");
        employee.setBranchId(1L);
        employee.setPositionId(10L);
        employee.setBaseSalary(new BigDecimal("10000000"));
        employee.setAllowance(new BigDecimal("500000"));
        return employee;
    }

    private WorkShift shift(Long id) {
        WorkShift shift = new WorkShift();
        ReflectionTestUtils.setField(shift, "id", id);
        shift.setCode("DAY");
        shift.setName("Day shift");
        shift.setStartTime(LocalTime.of(8, 0));
        shift.setEndTime(LocalTime.of(17, 0));
        return shift;
    }
}
