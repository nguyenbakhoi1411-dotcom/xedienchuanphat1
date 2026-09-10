package com.chuanphat.warranty.crm.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * CrmAlert — hệ thống cảnh báo tự động cho CRM.
 *
 * 7 loại alert:
 *   LEAD_STALE          — Lead > 3 ngày chưa liên hệ
 *   QUOTED_NO_BUY       — Báo giá > 7 ngày chưa mua
 *   WARRANTY_EXPIRING   — Bảo hành còn < 30 ngày
 *   NO_MAINTENANCE      — Chưa bảo dưỡng > 180 ngày
 *   OVERDUE_DEBT        — Công nợ quá hạn
 *   BIRTHDAY            — Sinh nhật trong 7 ngày tới
 *   INACTIVE_90_DAYS    — Khách > 90 ngày chưa quay lại
 */
@Entity
@Table(name = "crm_alerts")
public class CrmAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String alertType;

    private Long customerId;
    private Long leadId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(nullable = false, length = 20)
    private String severity = "INFO"; // INFO | WARNING | URGENT

    @Column(name = "is_dismissed", nullable = false)
    private boolean dismissed = false;

    @Column(length = 120)
    private String dismissedBy;

    private OffsetDateTime dismissedAt;

    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public boolean isDismissed() { return dismissed; }
    public void dismiss(String by) { this.dismissed = true; this.dismissedBy = by; this.dismissedAt = OffsetDateTime.now(); }
    public String getDismissedBy() { return dismissedBy; }
    public OffsetDateTime getDismissedAt() { return dismissedAt; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
