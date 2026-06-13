package com.chuanphat.warranty.hr.controller;

import com.chuanphat.warranty.hr.dto.HrDtos;
import com.chuanphat.warranty.hr.service.HrService;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr")
public class HrController {
    private final HrService hrService;

    public HrController(HrService hrService) {
        this.hrService = hrService;
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.EmployeeResponse> employees(@RequestParam(required = false) Long branchId) {
        return hrService.employees(branchId);
    }

    @PostMapping("/employees")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.EmployeeResponse createEmployee(@RequestBody HrDtos.EmployeeRequest request) {
        return hrService.createEmployee(request);
    }

    @PutMapping("/employees/{id}")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.EmployeeResponse updateEmployee(@PathVariable Long id, @RequestBody HrDtos.EmployeeRequest request) {
        return hrService.updateEmployee(id, request);
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.DepartmentResponse> departments() {
        return hrService.departments();
    }

    @GetMapping("/positions")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.PositionResponse> positions() {
        return hrService.positions();
    }

    @GetMapping("/shifts")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.WorkShiftResponse> shifts() {
        return hrService.shifts();
    }

    @GetMapping("/attendances")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.AttendanceResponse> attendances(@RequestParam(required = false) Long employeeId,
                                                       @RequestParam(required = false) LocalDate from,
                                                       @RequestParam(required = false) LocalDate to) {
        return hrService.attendances(employeeId, from, to);
    }

    @PostMapping("/attendances")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.AttendanceResponse attendance(@RequestBody HrDtos.AttendanceRequest request) {
        return hrService.checkAttendance(request);
    }

    @GetMapping("/leaves")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.LeaveResponse> leaves(@RequestParam(required = false) String status) {
        return hrService.leaves(status);
    }

    @PostMapping("/leaves")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.LeaveResponse createLeave(@RequestBody HrDtos.LeaveRequestPayload request) {
        return hrService.createLeave(request);
    }

    @PatchMapping("/leaves/{id}/approval")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.LeaveResponse approveLeave(@PathVariable Long id, @RequestBody HrDtos.LeaveApprovalRequest request) {
        return hrService.approveLeave(id, request);
    }

    @GetMapping("/commission-rules")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.CommissionRuleResponse> commissionRules() {
        return hrService.commissionRules();
    }

    @PostMapping("/commission-rules")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.CommissionRuleResponse createCommissionRule(@RequestBody HrDtos.CommissionRuleRequest request) {
        return hrService.createCommissionRule(request);
    }

    @GetMapping("/payrolls")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public List<HrDtos.PayrollResponse> payrolls(@RequestParam(required = false) Integer month,
                                                 @RequestParam(required = false) Integer year) {
        YearMonth ym = YearMonth.now();
        return hrService.payrolls(month == null ? ym.getMonthValue() : month, year == null ? ym.getYear() : year);
    }

    @PostMapping("/payrolls/generate")
    @PreAuthorize("hasAuthority('HR_MANAGE')")
    public HrDtos.PayrollResponse generatePayroll(@RequestBody HrDtos.PayrollGenerateRequest request) {
        return hrService.generatePayroll(request);
    }

    @PostMapping("/kpis/calculate")
    @PreAuthorize("hasAuthority('HR_VIEW')")
    public HrDtos.KpiResponse calculateKpi(@RequestParam Long employeeId, @RequestParam Integer month, @RequestParam Integer year) {
        return hrService.calculateKpi(employeeId, month, year);
    }
}
