package com.chuanphat.warranty.hr.dto;

import com.chuanphat.warranty.hr.entity.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

public final class HrDtos {
    private HrDtos() {}

    public record EmployeeRequest(String employeeCode, String fullName, String phone, String email, Long branchId,
                                  Long departmentId, Long positionId, LocalDate hireDate, String status,
                                  BigDecimal baseSalary, BigDecimal allowance, Long userId) {}
    public record EmployeeResponse(Long id, String employeeCode, String fullName, String phone, String email,
                                   Long branchId, Long departmentId, Long positionId, LocalDate hireDate,
                                   String status, BigDecimal baseSalary, BigDecimal allowance, Long userId) {
        public static EmployeeResponse from(Employee e) {
            return new EmployeeResponse(e.getId(), e.getEmployeeCode(), e.getFullName(), e.getPhone(), e.getEmail(),
                    e.getBranchId(), e.getDepartmentId(), e.getPositionId(), e.getHireDate(), e.getStatus(),
                    e.getBaseSalary(), e.getAllowance(), e.getUserId());
        }
    }

    public record DepartmentResponse(Long id, String code, String name, Long branchId) {
        public static DepartmentResponse from(Department d) { return new DepartmentResponse(d.getId(), d.getCode(), d.getName(), d.getBranchId()); }
    }
    public record PositionResponse(Long id, String code, String name, Long departmentId) {
        public static PositionResponse from(Position p) { return new PositionResponse(p.getId(), p.getCode(), p.getName(), p.getDepartmentId()); }
    }
    public record WorkShiftResponse(Long id, String code, String name, LocalTime startTime, LocalTime endTime, Integer breakMinutes) {
        public static WorkShiftResponse from(WorkShift s) { return new WorkShiftResponse(s.getId(), s.getCode(), s.getName(), s.getStartTime(), s.getEndTime(), s.getBreakMinutes()); }
    }

    public record AttendanceRequest(Long employeeId, LocalDate workDate, Long workShiftId, OffsetDateTime checkIn, OffsetDateTime checkOut, String note) {}
    public record AttendanceResponse(Long id, Long employeeId, LocalDate workDate, Long workShiftId,
                                     OffsetDateTime checkIn, OffsetDateTime checkOut, Integer lateMinutes,
                                     Integer earlyLeaveMinutes, BigDecimal overtimeHours, String status, String note) {
        public static AttendanceResponse from(Attendance a) {
            return new AttendanceResponse(a.getId(), a.getEmployeeId(), a.getWorkDate(), a.getWorkShiftId(), a.getCheckIn(),
                    a.getCheckOut(), a.getLateMinutes(), a.getEarlyLeaveMinutes(), a.getOvertimeHours(), a.getStatus(), a.getNote());
        }
    }

    public record LeaveRequestPayload(Long employeeId, LocalDate fromDate, LocalDate toDate, String reason, String leaveType) {}
    public record LeaveApprovalRequest(String status, Long approvedBy, String rejectedReason) {}
    public record LeaveResponse(Long id, Long employeeId, LocalDate fromDate, LocalDate toDate, BigDecimal daysCount,
                                String reason, String status, Long approvedBy) {
        public static LeaveResponse from(LeaveRequest l) {
            return new LeaveResponse(l.getId(), l.getEmployeeId(), l.getFromDate(), l.getToDate(), l.getDaysCount(), l.getReason(), l.getStatus(), l.getApprovedBy());
        }
    }

    public record CommissionRuleRequest(String name, Long positionId, String productCategory, String commissionType,
                                        BigDecimal commissionValue, BigDecimal minRevenue, Boolean active) {}
    public record CommissionRuleResponse(Long id, String name, Long positionId, String commissionType,
                                         BigDecimal commissionValue, BigDecimal minRevenue, boolean active) {
        public static CommissionRuleResponse from(CommissionRule r) {
            return new CommissionRuleResponse(r.getId(), r.getName(), r.getPositionId(), r.getCommissionType(), r.getCommissionValue(), r.getMinRevenue(), r.isActive());
        }
    }

    public record PayrollGenerateRequest(Long employeeId, Integer month, Integer year, BigDecimal advanceTaken,
                                         BigDecimal kpiBonus, boolean recordAccounting) {}
    public record PayrollItemResponse(Long id, String itemType, String description, BigDecimal amount) {
        public static PayrollItemResponse from(PayrollItem i) { return new PayrollItemResponse(i.getId(), i.getItemType(), i.getDescription(), i.getAmount()); }
    }
    public record PayrollResponse(Long id, String payrollCode, Long employeeId, Long branchId, Integer month, Integer year,
                                  BigDecimal baseSalary, BigDecimal allowance, BigDecimal commission, BigDecimal kpiBonus,
                                  BigDecimal overtimePay, BigDecimal deductionLate, BigDecimal advanceTaken,
                                  BigDecimal grossSalary, BigDecimal netSalary, String status, List<PayrollItemResponse> items) {
        public static PayrollResponse from(Payroll p) {
            return new PayrollResponse(p.getId(), p.getPayrollCode(), p.getEmployeeId(), p.getBranchId(), p.getMonth(), p.getYear(),
                    p.getBaseSalary(), p.getAllowance(), p.getCommission(), p.getKpiBonus(), p.getOvertimePay(),
                    p.getDeductionLate(), p.getAdvanceTaken(), p.getGrossSalary(), p.getNetSalary(), p.getStatus(),
                    p.getItems().stream().map(PayrollItemResponse::from).toList());
        }
    }

    public record KpiResponse(Long id, Long employeeId, Integer month, Integer year, Integer leadsHandled,
                              Integer quotationsSent, Integer ordersClosed, BigDecimal revenue, BigDecimal profit,
                              BigDecimal conversionRate, Integer serviceTicketsHandled, BigDecimal kpiScore) {
        public static KpiResponse from(KPI k) {
            return new KpiResponse(k.getId(), k.getEmployeeId(), k.getMonth(), k.getYear(), k.getLeadsHandled(),
                    k.getQuotationsSent(), k.getOrdersClosed(), k.getRevenue(), k.getProfit(), k.getConversionRate(),
                    k.getServiceTicketsHandled(), k.getKpiScore());
        }
    }
}
