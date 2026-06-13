package com.chuanphat.warranty.crm;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.crm.entity.CrmAlert;
import com.chuanphat.warranty.crm.entity.Lead;
import com.chuanphat.warranty.crm.enums.LeadStatus;
import com.chuanphat.warranty.crm.repository.CrmAlertRepository;
import com.chuanphat.warranty.crm.repository.LeadRepository;
import com.chuanphat.warranty.repository.WarrantyRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CrmAlertService — Hệ thống cảnh báo tự động 7 loại.
 *
 * Chạy daily via @Scheduled.
 */
@Service
public class CrmAlertService {

    private static final Logger log = LoggerFactory.getLogger(CrmAlertService.class);

    private static final String LEAD_STALE        = "LEAD_STALE";
    private static final String QUOTED_NO_BUY     = "QUOTED_NO_BUY";
    private static final String WARRANTY_EXPIRING  = "WARRANTY_EXPIRING";
    private static final String NO_MAINTENANCE    = "NO_MAINTENANCE";
    private static final String OVERDUE_DEBT      = "OVERDUE_DEBT";
    private static final String BIRTHDAY          = "BIRTHDAY";
    private static final String INACTIVE_90_DAYS  = "INACTIVE_90_DAYS";

    private final CrmAlertRepository alertRepo;
    private final CustomerRepository customerRepo;
    private final LeadRepository leadRepo;
    private final WarrantyRepository warrantyRepo;

    public CrmAlertService(CrmAlertRepository alertRepo,
                           CustomerRepository customerRepo,
                           LeadRepository leadRepo,
                           WarrantyRepository warrantyRepo) {
        this.alertRepo    = alertRepo;
        this.customerRepo = customerRepo;
        this.leadRepo     = leadRepo;
        this.warrantyRepo = warrantyRepo;
    }

    // ── Public API ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CrmAlert> getActiveAlerts(int page, int size) {
        return alertRepo.findByDismissedFalseOrderBySeverityDescCreatedAtDesc(
                PageRequest.of(page, size)).getContent();
    }

    @Transactional(readOnly = true)
    public List<CrmAlert> getAlertsByCustomer(Long customerId) {
        return alertRepo.findByCustomerIdAndDismissedFalseOrderByCreatedAtDesc(customerId);
    }

    @Transactional
    public void dismiss(Long alertId, String by) {
        alertRepo.findById(alertId).ifPresent(a -> {
            a.dismiss(by);
            alertRepo.save(a);
        });
    }

    @Transactional(readOnly = true)
    public long countUrgent() {
        return alertRepo.countBySeverityAndDismissedFalse("URGENT");
    }

    @Transactional(readOnly = true)
    public long countTotal() {
        return alertRepo.countByDismissedFalse();
    }

    // ── Scheduler ─────────────────────────────────────────────────

    /** Chạy mỗi sáng 7:00 */
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void runDailyAlerts() {
        log.info("[CRM-ALERT] Running daily alert engine...");
        int total = 0;
        total += alertLeadStale();
        total += alertQuotedNoBuy();
        total += alertWarrantyExpiring();
        total += alertNoMaintenance();
        total += alertOverdueDebt();
        total += alertBirthday();
        total += alertInactive90Days();
        alertRepo.deleteExpired(OffsetDateTime.now());
        log.info("[CRM-ALERT] Created {} new alerts.", total);
    }

    // ── Alert 1: Lead > 3 ngày chưa liên hệ ──────────────────────

    private int alertLeadStale() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(3);
        List<LeadStatus> terminal = List.of(LeadStatus.WON, LeadStatus.LOST, LeadStatus.CONVERTED);
        List<Lead> staleLeads = leadRepo.findByStatusNotInAndUpdatedAtBefore(terminal, cutoff);
        int count = 0;
        for (Lead lead : staleLeads) {
            if (alertRepo.existsByAlertTypeAndLeadIdAndDismissedFalse(LEAD_STALE, lead.getId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(LEAD_STALE);
            alert.setLeadId(lead.getId());
            alert.setTitle("Lead '" + lead.getLeadName() + "' chưa được liên hệ trong 3 ngày qua");
            alert.setDetail("Trạng thái: " + lead.getStatus() + " | Điện thoại: " + lead.getPhone());
            alert.setSeverity("WARNING");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(7));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }

    // ── Alert 2: Báo giá > 7 ngày chưa mua ──────────────────────

    private int alertQuotedNoBuy() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(7);
        List<Lead> quotedLeads = leadRepo.findByStatusAndUpdatedAtBefore(LeadStatus.QUOTED, cutoff);
        int count = 0;
        for (Lead lead : quotedLeads) {
            if (alertRepo.existsByAlertTypeAndLeadIdAndDismissedFalse(QUOTED_NO_BUY, lead.getId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(QUOTED_NO_BUY);
            alert.setLeadId(lead.getId());
            alert.setCustomerId(lead.getConvertedCustomerId());
            alert.setTitle("Khách '" + lead.getLeadName() + "' đã báo giá > 7 ngày nhưng chưa mua");
            alert.setDetail("Báo giá lúc: " + lead.getUpdatedAt() + " | Sản phẩm: " + lead.getInterestedProduct());
            alert.setSeverity("URGENT");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(14));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }

    // ── Alert 3: Bảo hành sắp hết ────────────────────────────────

    private int alertWarrantyExpiring() {
        LocalDate soon = LocalDate.now().plusDays(30);
        int count = 0;
        var expiring = warrantyRepo.findByEndDateBetween(LocalDate.now(), soon);
        for (var w : expiring) {
            if (alertRepo.existsByAlertTypeAndCustomerIdAndDismissedFalse(WARRANTY_EXPIRING, w.getCustomerId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(WARRANTY_EXPIRING);
            alert.setCustomerId(w.getCustomerId());
            alert.setTitle("Bảo hành xe " + w.getSerialNumber() + " sắp hết hạn ngày " + w.getEndDate());
            alert.setDetail("Serial: " + w.getSerialNumber() + " | Hết hạn: " + w.getEndDate());
            alert.setSeverity("INFO");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(35));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }

    // ── Alert 4: Lâu chưa bảo dưỡng ─────────────────────────────

    private int alertNoMaintenance() {
        LocalDate cutoff = LocalDate.now().minusDays(180);
        int count = 0;
        var customers = customerRepo.findByLastServiceDateBeforeOrLastServiceDateIsNull(cutoff);
        for (Customer customer : customers) {
            if (alertRepo.existsByAlertTypeAndCustomerIdAndDismissedFalse(NO_MAINTENANCE, customer.getId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(NO_MAINTENANCE);
            alert.setCustomerId(customer.getId());
            alert.setTitle(customer.getFullName() + " chưa bảo dưỡng trong hơn 6 tháng");
            alert.setDetail("Lần bảo dưỡng cuối: " + (customer.getLastServiceDate() != null ? customer.getLastServiceDate() : "Chưa có"));
            alert.setSeverity("INFO");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(14));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }

    // ── Alert 5: Công nợ quá hạn ─────────────────────────────────

    private int alertOverdueDebt() {
        int count = 0;
        var debtors = customerRepo.findByTotalDebtGreaterThan(java.math.BigDecimal.ZERO);
        for (Customer customer : debtors) {
            if (alertRepo.existsByAlertTypeAndCustomerIdAndDismissedFalse(OVERDUE_DEBT, customer.getId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(OVERDUE_DEBT);
            alert.setCustomerId(customer.getId());
            alert.setTitle(customer.getFullName() + " có công nợ chưa thanh toán");
            alert.setDetail("Công nợ hiện tại: " + String.format("%,.0f đ", customer.getTotalDebt()));
            alert.setSeverity("URGENT");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(7));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }

    // ── Alert 6: Sinh nhật ────────────────────────────────────────

    private int alertBirthday() {
        int count = 0;
        String todayMonthDay = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("MM-dd"));
        String plusWeekMonthDay = LocalDate.now().plusDays(7).format(java.time.format.DateTimeFormatter.ofPattern("MM-dd"));
        var birthdays = customerRepo.findUpcomingBirthdays(todayMonthDay, plusWeekMonthDay);
        for (Customer customer : birthdays) {
            if (alertRepo.existsByAlertTypeAndCustomerIdAndDismissedFalse(BIRTHDAY, customer.getId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(BIRTHDAY);
            alert.setCustomerId(customer.getId());
            alert.setTitle("🎂 Sinh nhật " + customer.getFullName() + " sắp đến!");
            alert.setDetail("Sinh nhật: " + customer.getBirthday() + " | Điện thoại: " + customer.getPhone());
            alert.setSeverity("INFO");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(8));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }

    // ── Alert 7: Khách > 90 ngày chưa quay lại ───────────────────

    private int alertInactive90Days() {
        LocalDate cutoff = LocalDate.now().minusDays(90);
        int count = 0;
        var customers = customerRepo.findByLastPurchaseDateBeforeAndTotalPurchaseCountGreaterThan(cutoff, 0);
        for (Customer customer : customers) {
            if (alertRepo.existsByAlertTypeAndCustomerIdAndDismissedFalse(INACTIVE_90_DAYS, customer.getId())) continue;
            CrmAlert alert = new CrmAlert();
            alert.setAlertType(INACTIVE_90_DAYS);
            alert.setCustomerId(customer.getId());
            alert.setTitle(customer.getFullName() + " chưa mua hàng trong 90 ngày");
            alert.setDetail("Lần mua cuối: " + customer.getLastPurchaseDate() + " | Tổng đã mua: " + customer.getTotalPurchaseCount() + " đơn");
            alert.setSeverity("WARNING");
            alert.setExpiresAt(OffsetDateTime.now().plusDays(14));
            alertRepo.save(alert);
            count++;
        }
        return count;
    }
}
