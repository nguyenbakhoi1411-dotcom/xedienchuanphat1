package com.chuanphat.warranty.ai;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DefaultAIInsightService implements AIInsightService {
    private final JdbcTemplate jdbcTemplate;
    private final BranchSecurity branchSecurity;
    private final AuditLogService auditLogService;
    private final boolean enabled;
    private final String mode;

    public DefaultAIInsightService(
            JdbcTemplate jdbcTemplate,
            BranchSecurity branchSecurity,
            AuditLogService auditLogService,
            @Value("${app.ai.enabled:false}") boolean enabled,
            @Value("${app.ai.mode:mock}") String mode
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.branchSecurity = branchSecurity;
        this.auditLogService = auditLogService;
        this.enabled = enabled;
        this.mode = mode;
    }

    @Override
    public AiDtos.AssistantStatus status() {
        return new AiDtos.AssistantStatus(enabled, mode, enabled ? "AI Assistant dang bat" : "AI Assistant dang tat theo cau hinh he thong", quickQuestions());
    }

    @Override
    @Transactional
    public AiDtos.AssistantResponse ask(AiDtos.AssistantRequest request) {
        if (!enabled) {
            return disabled();
        }
        String question = request == null ? "" : safeQuestion(request.question());
        if (question.isBlank()) {
            throw new BusinessException("Question is required");
        }
        Long scopedBranchId = branchSecurity.scopedBranchId(request.branchId());
        String normalized = normalize(question);
        String intent = detectIntent(normalized);
        AiDtos.AssistantResponse response = switch (intent) {
            case "PROFIT_RESTRICTED" -> noPermission("VIEW_PROFIT", "/reports");
            case "REVENUE_TODAY" -> revenueToday(scopedBranchId);
            case "BEST_BRANCH" -> bestBranch();
            case "SLOW_STOCK" -> slowStock(scopedBranchId);
            case "OVERDUE_DEBT" -> overdueDebt(scopedBranchId);
            case "WARRANTY_TOP_MODEL" -> warrantyTopModel(scopedBranchId);
            case "EMPLOYEE_CONVERSION" -> employeeConversion(scopedBranchId);
            case "PURCHASE_SUGGESTION" -> purchaseSuggestion(scopedBranchId);
            case "ANOMALY" -> anomalies(scopedBranchId);
            case "CUSTOMER_CARE" -> customerCare(scopedBranchId);
            case "ACTION_PROPOSAL" -> actionProposal(question);
            default -> overview(scopedBranchId);
        };
        audit(question, response.intent(), response.answer());
        return response;
    }

    private AiDtos.AssistantResponse revenueToday(Long branchId) {
        LocalDate today = LocalDate.now();
        BigDecimal revenue = money("""
                select coalesce(sum(total_amount),0)
                from sales_orders
                where status <> 'CANCELLED' and order_date = ? and (? is null or branch_id = ?)
                """, today, branchId, branchId);
        BigDecimal orders = money("""
                select count(*)
                from sales_orders
                where status <> 'CANCELLED' and order_date = ? and (? is null or branch_id = ?)
                """, today, branchId, branchId);
        return response("REVENUE_TODAY", "Doanh thu hom nay la " + formatMoney(revenue) + " voi " + orders.toPlainString() + " don hang.",
                List.of(metric("Doanh thu", revenue, "VND"), metric("Don hang", orders, "don")),
                List.of(), List.of(link("Mo bao cao doanh thu", "/reports?type=SALES")), List.of("Kiem tra them doanh thu theo nhan vien neu can dieu phoi ca ban hang."), null);
    }

    private AiDtos.AssistantResponse bestBranch() {
        Map<String, Object> row = one("""
                select coalesce(b.name, concat('Chi nhanh #', so.branch_id)) branchName, coalesce(sum(so.total_amount),0) revenue
                from sales_orders so
                left join branches b on b.id = so.branch_id
                where so.status <> 'CANCELLED' and so.order_date >= ?
                group by so.branch_id, b.name
                order by revenue desc
                limit 1
                """, LocalDate.now().minusDays(30));
        String branch = text(row, "branchName", "Chua co du lieu");
        BigDecimal revenue = decimal(row.get("revenue"));
        return response("BEST_BRANCH", "Trong 30 ngay gan day, " + branch + " dang ban tot nhat voi doanh thu " + formatMoney(revenue) + ".",
                List.of(metric("Doanh thu chi nhanh top", revenue, "VND")), List.of(), List.of(link("Mo bao cao theo chi nhanh", "/reports?type=BRANCH_PERFORMANCE")),
                List.of("So sanh them so don va bien loi nhuan neu tai khoan co quyen xem loi nhuan."), null);
    }

    private AiDtos.AssistantResponse slowStock(Long branchId) {
        List<Map<String, Object>> rows = list("""
                select p.product_name productName, coalesce(sum(s.quantity_on_hand),0) quantityOnHand,
                       max(ps.import_date) lastImportDate
                from inventory_stocks s
                join products p on p.id = s.product_id
                left join product_serials ps on ps.product_id = p.id and ps.branch_id = s.branch_id
                where (? is null or s.branch_id = ?)
                group by p.id, p.product_name
                having coalesce(sum(s.quantity_on_hand),0) > 0
                order by max(ps.import_date) asc nulls first, quantityOnHand desc
                limit 5
                """, branchId, branchId);
        return response("SLOW_STOCK", rows.isEmpty() ? "Chua thay xe ton lau trong pham vi du lieu hien co." : "Top xe can xem lai vi ton lau hoac ton nhieu: " + joinNames(rows, "productName") + ".",
                List.of(), List.of(), List.of(link("Mo bao cao hang ton lau", "/reports?type=SLOW_MOVING_STOCK")),
                rows.stream().map(row -> "Kiem tra " + text(row, "productName", "san pham") + " dang ton " + decimal(row.get("quantityOnHand")).toPlainString()).toList(), null);
    }

    private AiDtos.AssistantResponse overdueDebt(Long branchId) {
        BigDecimal amount = money("""
                select coalesce(sum(r.debit_amount - r.credit_amount),0)
                from receivables r
                join customers c on c.id = r.customer_id
                where r.status <> 'PAID' and r.due_date < ? and (? is null or c.branch_id = ?)
                """, LocalDate.now(), branchId, branchId);
        BigDecimal customers = money("""
                select count(distinct r.customer_id)
                from receivables r
                join customers c on c.id = r.customer_id
                where r.status <> 'PAID' and r.due_date < ? and (? is null or c.branch_id = ?)
                """, LocalDate.now(), branchId, branchId);
        return response("OVERDUE_DEBT", "Cong no qua han hien la " + formatMoney(amount) + " tren " + customers.toPlainString() + " khach hang.",
                List.of(metric("No qua han", amount, "VND"), metric("Khach qua han", customers, "khach")),
                amount.compareTo(BigDecimal.ZERO) > 0 ? List.of("Can uu tien nhac no cac khoan qua han lon.") : List.of(),
                List.of(link("Mo bao cao cong no", "/reports?type=CUSTOMER_DEBT_AGING")), List.of(), null);
    }

    private AiDtos.AssistantResponse warrantyTopModel(Long branchId) {
        Map<String, Object> row = one("""
                select p.product_name productName, count(*) tickets
                from service_tickets st
                join product_serials ps on ps.id = st.serial_id
                join products p on p.id = ps.product_id
                where st.service_type = 'WARRANTY' and st.received_date >= ? and (? is null or st.branch_id = ?)
                group by p.id, p.product_name
                order by tickets desc
                limit 1
                """, LocalDate.now().minusDays(90), branchId, branchId);
        String model = text(row, "productName", "Chua co du lieu");
        BigDecimal tickets = decimal(row.get("tickets"));
        return response("WARRANTY_TOP_MODEL", "Mau xe bao hanh nhieu nhat 90 ngay gan day la " + model + " voi " + tickets.toPlainString() + " phieu.",
                List.of(metric("Phieu bao hanh", tickets, "phieu")), tickets.compareTo(BigDecimal.ZERO) > 0 ? List.of("Nen doi chieu lo serial va nha cung cap cua mau nay.") : List.of(),
                List.of(link("Mo bao cao bao hanh", "/reports?type=WARRANTY_ANALYSIS")), List.of(), null);
    }

    private AiDtos.AssistantResponse employeeConversion(Long branchId) {
        Map<String, Object> row = one("""
                select coalesce(e.full_name, u.full_name, concat('Nhan vien #', so.employee_id)) employeeName,
                       count(*) orders, coalesce(sum(so.total_amount),0) revenue
                from sales_orders so
                left join employees e on e.id = so.employee_id
                left join app_users u on u.id = so.employee_id
                where so.status <> 'CANCELLED' and so.order_date >= ? and (? is null or so.branch_id = ?)
                group by so.employee_id, e.full_name, u.full_name
                order by orders desc, revenue desc
                limit 1
                """, LocalDate.now().minusDays(30), branchId, branchId);
        return response("EMPLOYEE_CONVERSION", text(row, "employeeName", "Chua co du lieu") + " dang co ket qua chot tot nhat 30 ngay gan day theo so don.",
                List.of(metric("So don", decimal(row.get("orders")), "don"), metric("Doanh thu", decimal(row.get("revenue")), "VND")),
                List.of(), List.of(link("Mo KPI nhan vien", "/hr")), List.of("Neu co du lieu lead/bao gia, nen doi chieu ty le chuyen doi that."), null);
    }

    private AiDtos.AssistantResponse purchaseSuggestion(Long branchId) {
        List<Map<String, Object>> rows = list("""
                select p.id productId, p.product_name productName,
                       coalesce(sum(s.quantity_on_hand),0) stockQty,
                       coalesce(sum(case when so.order_date >= ? then soi.quantity else 0 end),0) soldQty
                from products p
                left join inventory_stocks s on s.product_id = p.id and (? is null or s.branch_id = ?)
                left join sales_order_items soi on soi.product_id = p.id
                left join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED' and (? is null or so.branch_id = ?)
                group by p.id, p.product_name
                having coalesce(sum(case when so.order_date >= ? then soi.quantity else 0 end),0) > coalesce(sum(s.quantity_on_hand),0)
                order by soldQty desc
                limit 5
                """, LocalDate.now().minusDays(30), branchId, branchId, branchId, branchId, LocalDate.now().minusDays(30));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", rows);
        return response("PURCHASE_SUGGESTION", rows.isEmpty() ? "Chua co mat hang nao can goi y nhap them theo toc do ban 30 ngay." : "Nen xem xet nhap them: " + joinNames(rows, "productName") + ".",
                List.of(), List.of(), List.of(link("Mo bao cao du bao nhap hang", "/reports?type=EXECUTIVE_OPERATION")),
                rows.stream().map(row -> text(row, "productName", "San pham") + ": ban 30 ngay " + decimal(row.get("soldQty")).toPlainString() + ", ton " + decimal(row.get("stockQty")).toPlainString()).toList(),
                new AiDtos.ProposedAction("CREATE_PURCHASE_RECOMMENDATION", "De xuat nhap hang", "AI chi tao de xuat tham khao. Nguoi dung phai xac nhan truoc khi lap PO.", payload, true));
    }

    private AiDtos.AssistantResponse anomalies(Long branchId) {
        List<String> warnings = new ArrayList<>();
        BigDecimal cancelled = money("select count(*) from sales_orders where status = 'CANCELLED' and order_date >= ? and (? is null or branch_id = ?)", LocalDate.now().minusDays(7), branchId, branchId);
        BigDecimal negativeStock = money("select count(*) from inventory_stocks where quantity_on_hand < 0 and (? is null or branch_id = ?)", branchId, branchId);
        BigDecimal warrantyCost = money("select coalesce(sum(warranty_cost),0) from service_tickets where received_date >= ? and (? is null or branch_id = ?)", LocalDate.now().minusDays(30), branchId, branchId);
        if (cancelled.compareTo(new BigDecimal("5")) > 0) warnings.add("Don huy 7 ngay gan day cao: " + cancelled.toPlainString());
        if (negativeStock.compareTo(BigDecimal.ZERO) > 0) warnings.add("Co " + negativeStock.toPlainString() + " dong ton kho am.");
        if (warrantyCost.compareTo(new BigDecimal("50000000")) > 0) warnings.add("Chi phi bao hanh 30 ngay vuot nguong: " + formatMoney(warrantyCost));
        return response("ANOMALY", warnings.isEmpty() ? "Chua thay bat thuong lon theo nguong mac dinh." : "Co " + warnings.size() + " canh bao can kiem tra.",
                List.of(metric("Don huy 7 ngay", cancelled, "don"), metric("Ton kho am", negativeStock, "dong"), metric("Chi phi bao hanh 30 ngay", warrantyCost, "VND")),
                warnings, List.of(link("Mo dashboard dieu hanh", "/reports?type=EXECUTIVE_OPERATION")), List.of("Nen cau hinh nguong canh bao rieng theo tung chi nhanh khi co du lieu lich su."), null);
    }

    private AiDtos.AssistantResponse customerCare(Long branchId) {
        BigDecimal inactive = money("select count(*) from customers where (? is null or branch_id = ?) and (last_purchase_date is null or last_purchase_date < ?)", branchId, branchId, LocalDate.now().minusDays(120));
        BigDecimal vip = money("select count(*) from customers where (? is null or branch_id = ?) and tier in ('VIP','GOLD')", branchId, branchId);
        return response("CUSTOMER_CARE", "Co " + inactive.toPlainString() + " khach lau chua mua lai va " + vip.toPlainString() + " khach VIP nen cham soc.",
                List.of(metric("Khach lau chua mua", inactive, "khach"), metric("Khach VIP", vip, "khach")),
                List.of(), List.of(link("Mo CRM", "/crm"), link("Mo danh sach khach hang", "/customers")),
                List.of("Loc khach co bao hanh sap het han de goi bao duong.", "Uu tien khach VIP co lich su mua xe gia tri cao."), null);
    }

    private AiDtos.AssistantResponse actionProposal(String question) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("question", safeQuestion(question));
        return response("ACTION_PROPOSAL", "AI khong tu tao, sua, xoa hoac duyet chung tu. Toi chi co the tao de xuat va can ban xac nhan tren man hinh nghiep vu phu hop.",
                List.of(), List.of("Thao tac ghi du lieu bi chan cho den khi nguoi dung xac nhan."), List.of(),
                List.of("Mo man hinh nghiep vu lien quan, kiem tra du lieu, sau do thao tac bang quyen cua ban."),
                new AiDtos.ProposedAction("REQUIRES_USER_CONFIRMATION", "Can xac nhan thu cong", "Khong co thay doi du lieu nao duoc thuc hien.", payload, true));
    }

    private AiDtos.AssistantResponse overview(Long branchId) {
        BigDecimal revenue = money("select coalesce(sum(total_amount),0) from sales_orders where status <> 'CANCELLED' and order_date >= ? and (? is null or branch_id = ?)", LocalDate.now().minusDays(30), branchId, branchId);
        BigDecimal lowStock = money("select count(*) from inventory_stocks where quantity_on_hand <= min_quantity and (? is null or branch_id = ?)", branchId, branchId);
        return response("OVERVIEW", "Toi co the tra loi nhanh ve doanh thu, ton kho, cong no, bao hanh, KPI va canh bao bat thuong. Trong 30 ngay gan day doanh thu la " + formatMoney(revenue) + ".",
                List.of(metric("Doanh thu 30 ngay", revenue, "VND"), metric("Mat hang sap het", lowStock, "dong")),
                List.of("AI chi ho tro tham khao, khong thay the phe duyet nghiep vu."), List.of(link("Mo dashboard", "/dashboard")),
                quickQuestions(), null);
    }

    private AiDtos.AssistantResponse noPermission(String permission, String href) {
        return response("PROFIT_RESTRICTED", "Tai khoan hien tai khong co quyen " + permission + ", nen AI khong hien thi loi nhuan/gia von.",
                List.of(), List.of("Du lieu nhay cam da duoc an theo phan quyen."), List.of(link("Mo bao cao", href)), List.of(), null);
    }

    private AiDtos.AssistantResponse disabled() {
        return response("DISABLED", "AI Assistant dang tat theo cau hinh he thong.", List.of(), List.of(), List.of(), List.of(), null);
    }

    private String detectIntent(String question) {
        if ((question.contains("loi nhuan") || question.contains("lai")) && !hasAuthority("VIEW_PROFIT")) return "PROFIT_RESTRICTED";
        if (question.contains("gia von") && !hasAuthority("VIEW_COST_PRICE")) return "PROFIT_RESTRICTED";
        if (containsAny(question, "doanh thu hom nay", "hom nay bao nhieu")) return "REVENUE_TODAY";
        if (containsAny(question, "chi nhanh nao ban tot", "ban tot nhat")) return "BEST_BRANCH";
        if (containsAny(question, "ton lau", "hang cham ban", "xe nao ton")) return "SLOW_STOCK";
        if (containsAny(question, "no qua han", "cong no qua han")) return "OVERDUE_DEBT";
        if (containsAny(question, "bao hanh nhieu", "loi nhieu")) return "WARRANTY_TOP_MODEL";
        if (containsAny(question, "ty le chot", "nhan vien nao")) return "EMPLOYEE_CONVERSION";
        if (containsAny(question, "goi y nhap", "can nhap", "nhap hang")) return "PURCHASE_SUGGESTION";
        if (containsAny(question, "bat thuong", "canh bao", "giam gia qua", "ton kho am", "huy don nhieu")) return "ANOMALY";
        if (containsAny(question, "cham soc", "vip", "lau chua mua", "sap het bao hanh")) return "CUSTOMER_CARE";
        if (containsAny(question, "tao", "sua", "xoa", "huy don", "duyet", "lap phieu", "lap don", "nhap hang ngay")) return "ACTION_PROPOSAL";
        return "OVERVIEW";
    }

    private AiDtos.AssistantResponse response(String intent, String answer, List<AiDtos.Metric> metrics, List<String> warnings, List<AiDtos.Link> links, List<String> suggestions, AiDtos.ProposedAction proposedAction) {
        return new AiDtos.AssistantResponse(true, intent, answer, metrics, warnings, links, suggestions, proposedAction);
    }

    private AiDtos.Metric metric(String label, BigDecimal value, String unit) {
        return new AiDtos.Metric(label, value == null ? BigDecimal.ZERO : value, unit);
    }

    private AiDtos.Link link(String label, String href) {
        return new AiDtos.Link(label, href);
    }

    private List<String> quickQuestions() {
        return List.of(
                "Doanh thu hom nay bao nhieu?",
                "Chi nhanh nao ban tot nhat?",
                "Xe nao ton lau?",
                "Khach nao no qua han?",
                "Mau xe nao bao hanh nhieu?",
                "Can goi y nhap hang khong?"
        );
    }

    private boolean containsAny(String text, String... tokens) {
        for (String token : tokens) {
            if (text.contains(token)) return true;
        }
        return false;
    }

    private String normalize(String value) {
        String lower = value == null ? "" : value.toLowerCase(Locale.ROOT);
        return java.text.Normalizer.normalize(lower, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    }

    private String safeQuestion(String value) {
        if (value == null) return "";
        return value.length() > 500 ? value.substring(0, 500) : value.trim();
    }

    private BigDecimal money(String sql, Object... args) {
        BigDecimal value = jdbcTemplate.queryForObject(sql, BigDecimal.class, args);
        return value == null ? BigDecimal.ZERO : value;
    }

    private Map<String, Object> one(String sql, Object... args) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, args);
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }

    private List<Map<String, Object>> list(String sql, Object... args) {
        return jdbcTemplate.queryForList(sql, args);
    }

    private String text(Map<String, Object> row, String key, String fallback) {
        Object value = row.get(key);
        return value == null ? fallback : String.valueOf(value);
    }

    private BigDecimal decimal(Object value) {
        if (value instanceof BigDecimal bigDecimal) return bigDecimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(String.valueOf(value));
    }

    private String joinNames(List<Map<String, Object>> rows, String key) {
        return rows.stream().map(row -> text(row, key, "")).filter(value -> !value.isBlank()).limit(5).reduce((left, right) -> left + ", " + right).orElse("chua co du lieu");
    }

    private String formatMoney(BigDecimal value) {
        return String.format(Locale.US, "%,.0f VND", value == null ? BigDecimal.ZERO : value);
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream().anyMatch(item -> authority.equals(item.getAuthority()));
    }

    private void audit(String question, String intent, String answer) {
        auditLogService.record(new CreateAuditLogRequest(currentUsername(), AuditAction.AI_ASSISTANT_QUERY, AuditModule.SYSTEM, "AIAssistant", intent, sanitize(question), sanitize(answer), null, null));
    }

    private String sanitize(String value) {
        if (value == null) return null;
        String trimmed = value.replaceAll("\\d{9,}", "[masked-number]");
        return trimmed.length() > 300 ? trimmed.substring(0, 300) : trimmed;
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
