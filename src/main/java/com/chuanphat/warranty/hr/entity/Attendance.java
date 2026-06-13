package com.chuanphat.warranty.hr.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "attendances")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long employeeId;
    @Column(nullable = false)
    private LocalDate workDate;
    private Long workShiftId;
    private OffsetDateTime checkIn;
    private OffsetDateTime checkOut;
    private Integer lateMinutes = 0;
    private Integer earlyLeaveMinutes = 0;
    @Column(precision = 5, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;
    @Column(length = 20)
    private String status = "PRESENT";
    private String note;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public LocalDate getWorkDate() { return workDate; }
    public void setWorkDate(LocalDate workDate) { this.workDate = workDate; }
    public Long getWorkShiftId() { return workShiftId; }
    public void setWorkShiftId(Long workShiftId) { this.workShiftId = workShiftId; }
    public OffsetDateTime getCheckIn() { return checkIn; }
    public void setCheckIn(OffsetDateTime checkIn) { this.checkIn = checkIn; }
    public OffsetDateTime getCheckOut() { return checkOut; }
    public void setCheckOut(OffsetDateTime checkOut) { this.checkOut = checkOut; }
    public Integer getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes == null ? 0 : lateMinutes; }
    public Integer getEarlyLeaveMinutes() { return earlyLeaveMinutes; }
    public void setEarlyLeaveMinutes(Integer earlyLeaveMinutes) { this.earlyLeaveMinutes = earlyLeaveMinutes == null ? 0 : earlyLeaveMinutes; }
    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours == null ? BigDecimal.ZERO : overtimeHours; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
