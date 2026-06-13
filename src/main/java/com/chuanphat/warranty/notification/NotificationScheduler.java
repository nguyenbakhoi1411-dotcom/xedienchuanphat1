package com.chuanphat.warranty.notification;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {
    private final JdbcTemplate jdbcTemplate;
    private final NotificationService notificationService;
    private final ReminderRepository reminderRepository;

    public NotificationScheduler(JdbcTemplate jdbcTemplate, NotificationService notificationService, ReminderRepository reminderRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.notificationService = notificationService;
        this.reminderRepository = reminderRepository;
    }

    @Scheduled(cron = "0 15 7 * * *", zone = "Asia/Ho_Chi_Minh")
    public void dailyNotificationScan() {
        scanLowStock();
        scanOverdueDebts();
        scanWarrantyExpiry();
        scanOverdueServiceTickets();
        scanNewLeads();
        scanDueCrmTasks();
        scanDueReminders();
        scanPendingTransfers();
    }

    private void scanLowStock() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select s.id, p.product_name, s.available_quantity, s.min_quantity
                from inventory_stocks s
                join products p on p.id = s.product_id
                where s.available_quantity <= s.min_quantity
                limit 100
                """);
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce(
                    "LOW_STOCK",
                    NotificationSeverity.WARNING,
                    "INVENTORY",
                    id(row),
                    "Ton kho thap",
                    row.get("product_name") + " con " + row.get("available_quantity") + " san pham"
            );
        }
    }

    private void scanOverdueDebts() {
        LocalDate today = LocalDate.now();
        notifyDebt("CUSTOMER_DEBT_OVERDUE", "ACCOUNTING", "Cong no khach hang qua han", "receivables", "customer_name", today);
        notifyDebt("SUPPLIER_DEBT_OVERDUE", "ACCOUNTING", "Cong no nha cung cap qua han", "payables", "supplier_name", today);
    }

    private void notifyDebt(String type, String module, String title, String table, String nameColumn, LocalDate today) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select id, %s party_name, due_date
                from %s
                where status <> 'PAID' and due_date < ?
                limit 100
                """.formatted(nameColumn, table), today);
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce(type, NotificationSeverity.ERROR, module, id(row), title, row.get("party_name") + " qua han tu " + row.get("due_date"));
        }
    }

    private void scanWarrantyExpiry() {
        LocalDate today = LocalDate.now();
        LocalDate soon = today.plusDays(30);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select id, customer_name, serial_number, end_date
                from warranties
                where status = 'ACTIVE' and end_date between ? and ?
                limit 100
                """, today, soon);
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce(
                    "WARRANTY_EXPIRING",
                    NotificationSeverity.WARNING,
                    "WARRANTY",
                    id(row),
                    "Bao hanh sap het han",
                    row.get("serial_number") + " cua " + row.get("customer_name") + " het han " + row.get("end_date")
            );
        }
    }

    private void scanOverdueServiceTickets() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select id, customer_name, serial_number, created_at
                from service_tickets
                where status not in ('COMPLETED','RETURNED','CANCELLED')
                  and created_at < ?
                limit 100
                """, java.sql.Timestamp.valueOf(java.time.LocalDateTime.now().minusDays(3)));
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce("SERVICE_TICKET_OVERDUE", NotificationSeverity.WARNING, "WARRANTY", id(row), "Phieu sua chua qua han", row.get("serial_number") + " - " + row.get("customer_name"));
        }
    }

    private void scanNewLeads() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select id, lead_name, created_at
                from crm_leads
                where status = 'NEW' and created_at < ?
                limit 100
                """, java.sql.Timestamp.valueOf(java.time.LocalDateTime.now().minusDays(1)));
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce("NEW_LEAD_UNTOUCHED", NotificationSeverity.INFO, "CRM", id(row), "Lead moi chua cham soc", String.valueOf(row.get("lead_name")));
        }
    }

    private void scanDueCrmTasks() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select id, title, due_date
                from crm_care_tasks
                where status <> 'DONE' and due_date <= ?
                limit 100
                """, LocalDate.now());
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce("CRM_TASK_DUE", NotificationSeverity.WARNING, "CRM", id(row), "Task cham soc den han", row.get("title") + " - " + row.get("due_date"));
        }
    }

    private void scanDueReminders() {
        for (Reminder reminder : reminderRepository.findByStatusAndReminderDateLessThanEqual(ReminderStatus.PENDING, LocalDate.now())) {
            notificationService.notifyAllOnce("REMINDER_DUE", NotificationSeverity.INFO, "REMINDER", reminder.getId(), "Reminder den han", reminder.getTitle());
        }
    }

    private void scanPendingTransfers() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select id, transfer_no
                from inventory_transfers
                where status in ('REQUESTED','PENDING_APPROVAL')
                limit 100
                """);
        for (Map<String, Object> row : rows) {
            notificationService.notifyAllOnce("TRANSFER_PENDING_APPROVAL", NotificationSeverity.WARNING, "INVENTORY", id(row), "Chuyen kho can duyet", String.valueOf(row.get("transfer_no")));
        }
    }

    private Long id(Map<String, Object> row) {
        Object value = row.get("id");
        return value instanceof Number number ? number.longValue() : null;
    }
}
