package com.chuanphat.warranty.ai;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DefaultAIInsightService implements AIInsightService {

    private static final Logger log = LoggerFactory.getLogger(DefaultAIInsightService.class);
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

    private final JdbcTemplate jdbcTemplate;
    private final BranchSecurity branchSecurity;
    private final AuditLogService auditLogService;
    private final boolean enabled;
    private final String mode;
    private final String apiKey;

    public DefaultAIInsightService(
            JdbcTemplate jdbcTemplate,
            BranchSecurity branchSecurity,
            AuditLogService auditLogService,
            @Value("${app.ai.enabled:false}") boolean enabled,
            @Value("${app.ai.mode:mock}") String mode,
            @Value("${app.ai.anthropic-key:}") String apiKey
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.branchSecurity = branchSecurity;
        this.auditLogService = auditLogService;
        this.enabled = enabled;
        this.mode = mode;
        // Fallback to ANTHROPIC_API_KEY env var if property not set
        this.apiKey = (apiKey != null && !apiKey.isBlank()) ? apiKey
                : System.getenv("ANTHROPIC_API_KEY") != null ? System.getenv("ANTHROPIC_API_KEY") : "";
    }

    @Override
    public AiDtos.AssistantStatus status() {
        boolean claudeReady = "claude".equalsIgnoreCase(mode) && !apiKey.isBlank();
        String msg = !enabled ? "AI Assistant dang tat theo cau hinh he thong"
                : claudeReady ? "AI Assistant dang hoat dong voi Claude AI"
                : "AI Assistant dang hoat dong voi phan tich du lieu thong minh";
        return new AiDtos.AssistantStatus(enabled, mode, msg, quickQuestions());
    }

    @Override
    @Transactional
    public AiDtos.AssistantResponse ask(AiDtos.AssistantRequest request) {
        if (!enabled) {
            return disabled();
        }
        String question = request == null ? "" : safeQuestion(request.question());
        if (question.isBlank()) {
            throw new BusinessException("Vui lòng nhập câu hỏi");
        }
        Long scopedBranchId = branchSecurity.scopedBranchId(request.branchId());
        String normalized = normalize(question);
        String intent = detectIntent(normalized);

        // If claude mode with valid key — send enriched context to Claude
        if ("claude".equalsIgnoreCase(mode) && !apiKey.isBlank()) {
            AiDtos.AssistantResponse claudeResp = askClaude(question, intent, scopedBranchId);
            if (claudeResp != null) {
                audit(question, intent, claudeResp.answer());
                return claudeResp;
            }
        }

        // Fallback to rule-based responses
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

    // ─── Anthropic Claude integration ────────────────────────────────────────

    private AiDtos.AssistantResponse askClaude(String question, String intent, Long branchId) {
        try {
            String contextJson = buildContextJson(intent, branchId);
            String systemPrompt = """
                    Bạn là trợ lý AI phân tích kinh doanh cho chuỗi đại lý xe máy Chuẩn Phát tại Nghệ An.
                    Bạn nhận dữ liệu thực từ hệ thống quản lý và trả lời bằng tiếng Việt, ngắn gọn, chính xác, thân thiện.
                    Quy tắc:
                    - Luôn trả lời bằng tiếng Việt
                    - Không bịa đặt số liệu — chỉ dùng dữ liệu được cung cấp
                    - Nếu dữ liệu trống, thông báo "Chưa có dữ liệu" một cách rõ ràng
                    - Trả lời dưới 300 từ, súc tích
                    - Đề xuất hành động cụ thể khi phù hợp
                    - KHÔNG thực hiện bất kỳ thao tác ghi/xóa/duyệt nào — chỉ phân tích
                    """;

            String userMessage = String.format(
                    "Câu hỏi: %s\n\nDữ liệu thực từ hệ thống (JSON):\n%s",
                    question, contextJson
            );

            String requestBody = String.format("""
                    {
                        "model": "%s",
                        "max_tokens": 1024,
                        "system": %s,
                        "messages": [{"role": "user", "content": %s}]
                    }
                    """,
                    CLAUDE_MODEL,
                    escapeJson(systemPrompt),
                    escapeJson(userMessage)
            );

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpReq = HttpRequest.newBuilder()
                    .uri(URI.create(CLAUDE_API_URL))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> resp = client.send(httpReq, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() == 200) {
                String body = resp.body();
                String answer = extractClaudeAnswer(body);
                return response(intent, answer, List.of(), List.of(),
                        List.of(link("Mở báo cáo liên quan", resolveReportLink(intent))),
                        quickQuestions(), null);
            } else {
                log.warn("Claude API returned status {}: {}", resp.statusCode(), resp.body());
            }
        } catch (Exception e) {
            log.warn("Claude API call failed, falling back to rule-based: {}", e.getMessage());
        }
        return null;
    }

    private String buildContextJson(String intent, Long branchId) {
        Map<String, Object> ctx = new LinkedHashMap<>();
        ctx.put("date", LocalDate.now().toString());
        ctx.put("branchId", branchId);

        try {
            switch (intent) {
                case "REVENUE_TODAY" -> {
                    ctx.put("todayRevenue", money("select coalesce(sum(total_amount),0) from sales_orders where status <> 'CANCELLED' and order_date = ? and (? is null or branch_id = ?)", LocalDate.now(), branchId, branchId));
                    ctx.put("todayOrders", money("select count(*) from sales_orders where status <> 'CANCELLED' and order_date = ? and (? is null or branch_id = ?)", LocalDate.now(), branchId, branchId));
                    ctx.put("monthRevenue", money("select coalesce(sum(total_amount),0) from sales_orders where status <> 'CANCELLED' and order_date >= date_trunc('month', current_date) and (? is null or branch_id = ?)", branchId, branchId));
                }
                case "SLOW_STOCK" -> {
                    List<Map<String, Object>> rows = list("select p.product_name, coalesce(sum(s.quantity_on_hand),0) qty from inventory_stocks s join products p on p.id = s.product_id where (? is null or s.branch_id = ?) group by p.id, p.product_name having qty > 0 order by qty asc limit 10", branchId, branchId);
                    ctx.put("slowStock", rows);
                }
                case "OVERDUE_DEBT" -> {
                    ctx.put("overdueAmount", money("select coalesce(sum(r.debit_amount - r.credit_amount),0) from receivables r join customers c on c.id = r.customer_id where r.status <> 'PAID' and r.due_date < current_date and (? is null or c.branch_id = ?)", branchId, branchId));
                    ctx.put("overdueCustomers", money("select count(distinct r.customer_id) from receivables r join customers c on c.id = r.customer_id where r.status <> 'PAID' and r.due_date < current_date and (? is null or c.branch_id = ?)", branchId, branchId));
                }
                case "PURCHASE_SUGGESTION" -> {
                    List<Map<String, Object>> rows = list("select p.product_name, coalesce(sum(s.quantity_on_hand),0) stock, coalesce(sum(case when so.order_date >= dateadd('day',-30,current_date) then soi.quantity else 0 end),0) sold30d from products p left join inventory_stocks s on s.product_id = p.id and (? is null or s.branch_id = ?) left join sales_order_items soi on soi.product_id = p.id left join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED' group by p.id, p.product_name order by sold30d desc limit 10", branchId, branchId);
                    ctx.put("stockVsSales", rows);
                }
                default -> {
                    ctx.put("monthRevenue", money("select coalesce(sum(total_amount),0) from sales_orders where status <> 'CANCELLED' and order_date >= dateadd('day',-30,current_date) and (? is null or branch_id = ?)", branchId, branchId));
                    ctx.put("monthOrders", money("select count(*) from sales_orders where status <> 'CANCELLED' and order_date >= dateadd('day',-30,current_date) and (? is null or branch_id = ?)", branchId, branchId));
                    ctx.put("lowStockItems", money("select count(*) from inventory_stocks where quantity_on_hand <= min_quantity and (? is null or branch_id = ?)", branchId, branchId));
                    ctx.put("overdueDebt", money("select coalesce(sum(r.debit_amount - r.credit_amount),0) from receivables r where r.status <> 'PAID' and r.due_date < current_date", new Object[0]));
                    ctx.put("cashBalance", money("select coalesce((select coalesce(sum(amount),0) from cash_receipts where status='CONFIRMED') - (select coalesce(sum(amount),0) from cash_payments where status='CONFIRMED'), 0)"));
                    ctx.put("todayPayments", money("select coalesce(sum(amount),0) from cash_payments where status='CONFIRMED' and payment_date = current_date and (? is null or branch_id = ?)", branchId, branchId));
                }
            }
        } catch (Exception e) {
            log.debug("Context build partial error: {}", e.getMessage());
        }
        return mapToJson(ctx);
    }

    private String extractClaudeAnswer(String responseBody) {
        // Parse: {"content":[{"type":"text","text":"..."}],...}
        try {
            int textIdx = responseBody.indexOf("\"text\":");
            if (textIdx < 0) return "Không thể phân tích phản hồi từ AI.";
            int start = responseBody.indexOf('"', textIdx + 7) + 1;
            int end = start;
            while (end < responseBody.length()) {
                char c = responseBody.charAt(end);
                if (c == '"' && responseBody.charAt(end - 1) != '\\') break;
                end++;
            }
            return responseBody.substring(start, end)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .replace("\\\\", "\\");
        } catch (Exception e) {
            return "Không thể phân tích phản hồi từ AI.";
        }
    }

    private String escapeJson(String value) {
        if (value == null) return "\"\"";
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(entry.getKey()).append("\":");
            Object v = entry.getValue();
            if (v == null) sb.append("null");
            else if (v instanceof Number) sb.append(v);
            else if (v instanceof List<?> list) sb.append(listToJson(list));
            else sb.append(escapeJson(v.toString()));
        }
        sb.append("}");
        return sb.toString();
    }

    private String listToJson(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Object item : list) {
            if (!first) sb.append(",");
            first = false;
            if (item instanceof Map<?, ?> m) {
                sb.append("{");
                boolean ff = true;
                for (Map.Entry<?, ?> e : m.entrySet()) {
                    if (!ff) sb.append(",");
                    ff = false;
                    sb.append("\"").append(e.getKey()).append("\":");
                    Object v = e.getValue();
                    if (v == null) sb.append("null");
                    else if (v instanceof Number) sb.append(v);
                    else sb.append(escapeJson(v.toString()));
                }
                sb.append("}");
            } else {
                sb.append(escapeJson(item == null ? "" : item.toString()));
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private String resolveReportLink(String intent) {
        return switch (intent) {
            case "REVENUE_TODAY" -> "/reports?type=SALES";
            case "SLOW_STOCK" -> "/reports?type=SLOW_MOVING_STOCK";
            case "OVERDUE_DEBT" -> "/reports?type=CUSTOMER_DEBT_AGING";
            case "PURCHASE_SUGGESTION" -> "/reports?type=EXECUTIVE_OPERATION";
            case "WARRANTY_TOP_MODEL" -> "/reports?type=WARRANTY_ANALYSIS";
            default -> "/dashboard";
        };
    }

    // ─── Rule-based responses (fallback) ─────────────────────────────────────

    private AiDtos.AssistantResponse revenueToday(Long branchId) {
        LocalDate today = LocalDate.now();
        BigDecimal revenue = money("select coalesce(sum(total_amount),0) from sales_orders where status <> 'CANCELLED' and order_date = ? and (? is null or branch_id = ?)", today, branchId, branchId);
        BigDecimal orders = money("select count(*) from sales_orders where status <> 'CANCELLED' and order_date = ? and (? is null or branch_id = ?)", today, branchId, branchId);
        return response("REVENUE_TODAY",
                "Doanh thu hôm nay là " + formatMoney(revenue) + " với " + orders.toPlainString() + " đơn hàng.",
                List.of(metric("Doanh thu", revenue, "VND"), metric("Đơn hàng", orders, "đơn")),
                List.of(), List.of(link("Mở báo cáo doanh thu", "/reports?type=SALES")),
                List.of("Kiểm tra thêm doanh thu theo nhân viên nếu cần điều phối ca bán hàng."), null);
    }

    private AiDtos.AssistantResponse bestBranch() {
        Map<String, Object> row = one("select coalesce(b.name, concat('Chi nhánh #', so.branch_id)) branchName, coalesce(sum(so.total_amount),0) revenue from sales_orders so left join branches b on b.id = so.branch_id where so.status <> 'CANCELLED' and so.order_date >= ? group by so.branch_id, b.name order by revenue desc limit 1", LocalDate.now().minusDays(30));
        String branch = text(row, "branchName", "Chưa có dữ liệu");
        BigDecimal revenue = decimal(row.get("revenue"));
        return response("BEST_BRANCH",
                "Trong 30 ngày gần đây, " + branch + " đang bán tốt nhất với doanh thu " + formatMoney(revenue) + ".",
                List.of(metric("Doanh thu chi nhánh top", revenue, "VND")), List.of(),
                List.of(link("Mở báo cáo theo chi nhánh", "/reports?type=BRANCH_PERFORMANCE")),
                List.of("So sánh thêm số đơn và biên lợi nhuận nếu tài khoản có quyền xem lợi nhuận."), null);
    }

    private AiDtos.AssistantResponse slowStock(Long branchId) {
        List<Map<String, Object>> rows = list("select p.product_name productName, coalesce(sum(s.quantity_on_hand),0) quantityOnHand, max(ps.import_date) lastImportDate from inventory_stocks s join products p on p.id = s.product_id left join product_serials ps on ps.product_id = p.id and ps.branch_id = s.branch_id where (? is null or s.branch_id = ?) group by p.id, p.product_name having coalesce(sum(s.quantity_on_hand),0) > 0 order by max(ps.import_date) asc nulls first, quantityOnHand desc limit 5", branchId, branchId);
        return response("SLOW_STOCK",
                rows.isEmpty() ? "Chưa thấy xe tồn lâu trong phạm vi dữ liệu hiện có." : "Top xe cần xem lại vì tồn lâu hoặc tồn nhiều: " + joinNames(rows, "productName") + ".",
                List.of(), List.of(), List.of(link("Mở báo cáo hàng tồn lâu", "/reports?type=SLOW_MOVING_STOCK")),
                rows.stream().map(row -> "Kiểm tra " + text(row, "productName", "sản phẩm") + " đang tồn " + decimal(row.get("quantityOnHand")).toPlainString()).toList(), null);
    }

    private AiDtos.AssistantResponse overdueDebt(Long branchId) {
        BigDecimal amount = money("select coalesce(sum(r.debit_amount - r.credit_amount),0) from receivables r join customers c on c.id = r.customer_id where r.status <> 'PAID' and r.due_date < ? and (? is null or c.branch_id = ?)", LocalDate.now(), branchId, branchId);
        BigDecimal customers = money("select count(distinct r.customer_id) from receivables r join customers c on c.id = r.customer_id where r.status <> 'PAID' and r.due_date < ? and (? is null or c.branch_id = ?)", LocalDate.now(), branchId, branchId);
        return response("OVERDUE_DEBT",
                "Công nợ quá hạn hiện là " + formatMoney(amount) + " trên " + customers.toPlainString() + " khách hàng.",
                List.of(metric("Nợ quá hạn", amount, "VND"), metric("Khách quá hạn", customers, "khách")),
                amount.compareTo(BigDecimal.ZERO) > 0 ? List.of("Cần ưu tiên nhắc nợ các khoản quá hạn lớn.") : List.of(),
                List.of(link("Mở báo cáo công nợ", "/reports?type=CUSTOMER_DEBT_AGING")), List.of(), null);
    }

    private AiDtos.AssistantResponse warrantyTopModel(Long branchId) {
        Map<String, Object> row = one("select p.product_name productName, count(*) tickets from service_tickets st join product_serials ps on ps.id = st.serial_id join products p on p.id = ps.product_id where st.service_type = 'WARRANTY' and st.received_date >= ? and (? is null or st.branch_id = ?) group by p.id, p.product_name order by tickets desc limit 1", LocalDate.now().minusDays(90), branchId, branchId);
        String model = text(row, "productName", "Chưa có dữ liệu");
        BigDecimal tickets = decimal(row.get("tickets"));
        return response("WARRANTY_TOP_MODEL",
                "Mẫu xe bảo hành nhiều nhất 90 ngày gần đây là " + model + " với " + tickets.toPlainString() + " phiếu.",
                List.of(metric("Phiếu bảo hành", tickets, "phiếu")),
                tickets.compareTo(BigDecimal.ZERO) > 0 ? List.of("Nên đối chiếu lô serial và nhà cung cấp của mẫu này.") : List.of(),
                List.of(link("Mở báo cáo bảo hành", "/reports?type=WARRANTY_ANALYSIS")), List.of(), null);
    }

    private AiDtos.AssistantResponse employeeConversion(Long branchId) {
        Map<String, Object> row = one("select coalesce(e.full_name, u.full_name, concat('Nhân viên #', so.employee_id)) employeeName, count(*) orders, coalesce(sum(so.total_amount),0) revenue from sales_orders so left join employees e on e.id = so.employee_id left join app_users u on u.id = so.employee_id where so.status <> 'CANCELLED' and so.order_date >= ? and (? is null or so.branch_id = ?) group by so.employee_id, e.full_name, u.full_name order by orders desc, revenue desc limit 1", LocalDate.now().minusDays(30), branchId, branchId);
        return response("EMPLOYEE_CONVERSION",
                text(row, "employeeName", "Chưa có dữ liệu") + " đang có kết quả chốt tốt nhất 30 ngày gần đây theo số đơn.",
                List.of(metric("Số đơn", decimal(row.get("orders")), "đơn"), metric("Doanh thu", decimal(row.get("revenue")), "VND")),
                List.of(), List.of(link("Mở KPI nhân viên", "/hr")),
                List.of("Nếu có dữ liệu lead/báo giá, nên đối chiếu tỷ lệ chuyển đổi thật."), null);
    }

    private AiDtos.AssistantResponse purchaseSuggestion(Long branchId) {
        List<Map<String, Object>> rows = list("select p.id productId, p.product_name productName, coalesce(sum(s.quantity_on_hand),0) stockQty, coalesce(sum(case when so.order_date >= ? then soi.quantity else 0 end),0) soldQty from products p left join inventory_stocks s on s.product_id = p.id and (? is null or s.branch_id = ?) left join sales_order_items soi on soi.product_id = p.id left join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED' and (? is null or so.branch_id = ?) group by p.id, p.product_name having coalesce(sum(case when so.order_date >= ? then soi.quantity else 0 end),0) > coalesce(sum(s.quantity_on_hand),0) order by soldQty desc limit 5", LocalDate.now().minusDays(30), branchId, branchId, branchId, branchId, LocalDate.now().minusDays(30));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", rows);
        return response("PURCHASE_SUGGESTION",
                rows.isEmpty() ? "Chưa có mặt hàng nào cần gợi ý nhập thêm theo tốc độ bán 30 ngày." : "Nên xem xét nhập thêm: " + joinNames(rows, "productName") + ".",
                List.of(), List.of(), List.of(link("Mở báo cáo dự báo nhập hàng", "/reports?type=EXECUTIVE_OPERATION")),
                rows.stream().map(row -> text(row, "productName", "Sản phẩm") + ": bán 30 ngày " + decimal(row.get("soldQty")).toPlainString() + ", tồn " + decimal(row.get("stockQty")).toPlainString()).toList(),
                new AiDtos.ProposedAction("CREATE_PURCHASE_RECOMMENDATION", "Đề xuất nhập hàng", "AI chỉ tạo đề xuất tham khảo. Người dùng phải xác nhận trước khi lập PO.", payload, true));
    }

    private AiDtos.AssistantResponse anomalies(Long branchId) {
        List<String> warnings = new ArrayList<>();
        BigDecimal cancelled = money("select count(*) from sales_orders where status = 'CANCELLED' and order_date >= ? and (? is null or branch_id = ?)", LocalDate.now().minusDays(7), branchId, branchId);
        BigDecimal negativeStock = money("select count(*) from inventory_stocks where quantity_on_hand < 0 and (? is null or branch_id = ?)", branchId, branchId);
        BigDecimal warrantyCost = money("select coalesce(sum(warranty_cost),0) from service_tickets where received_date >= ? and (? is null or branch_id = ?)", LocalDate.now().minusDays(30), branchId, branchId);
        if (cancelled.compareTo(new BigDecimal("5")) > 0) warnings.add("Đơn hủy 7 ngày gần đây cao: " + cancelled.toPlainString());
        if (negativeStock.compareTo(BigDecimal.ZERO) > 0) warnings.add("Có " + negativeStock.toPlainString() + " dòng tồn kho âm.");
        if (warrantyCost.compareTo(new BigDecimal("50000000")) > 0) warnings.add("Chi phí bảo hành 30 ngày vượt ngưỡng: " + formatMoney(warrantyCost));
        return response("ANOMALY",
                warnings.isEmpty() ? "Chưa thấy bất thường lớn theo ngưỡng mặc định." : "Có " + warnings.size() + " cảnh báo cần kiểm tra.",
                List.of(metric("Đơn hủy 7 ngày", cancelled, "đơn"), metric("Tồn kho âm", negativeStock, "dòng"), metric("Chi phí bảo hành 30 ngày", warrantyCost, "VND")),
                warnings, List.of(link("Mở dashboard điều hành", "/reports?type=EXECUTIVE_OPERATION")),
                List.of("Nên cấu hình ngưỡng cảnh báo riêng theo từng chi nhánh khi có đủ dữ liệu lịch sử."), null);
    }

    private AiDtos.AssistantResponse customerCare(Long branchId) {
        BigDecimal inactive = money("select count(*) from customers where (? is null or branch_id = ?) and (last_purchase_date is null or last_purchase_date < ?)", branchId, branchId, LocalDate.now().minusDays(120));
        BigDecimal vip = money("select count(*) from customers where (? is null or branch_id = ?) and tier in ('VIP','GOLD')", branchId, branchId);
        return response("CUSTOMER_CARE",
                "Có " + inactive.toPlainString() + " khách lâu chưa mua lại và " + vip.toPlainString() + " khách VIP nên chăm sóc.",
                List.of(metric("Khách lâu chưa mua", inactive, "khách"), metric("Khách VIP", vip, "khách")),
                List.of(), List.of(link("Mở CRM", "/crm"), link("Mở danh sách khách hàng", "/customers")),
                List.of("Lọc khách có bảo hành sắp hết hạn để gọi bảo dưỡng.", "Ưu tiên khách VIP có lịch sử mua xe giá trị cao."), null);
    }

    private AiDtos.AssistantResponse actionProposal(String question) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("question", safeQuestion(question));
        return response("ACTION_PROPOSAL",
                "AI không tự tạo, sửa, xóa hoặc duyệt chứng từ. Tôi chỉ có thể tạo đề xuất và cần bạn xác nhận trên màn hình nghiệp vụ phù hợp.",
                List.of(), List.of("Thao tác ghi dữ liệu bị chặn cho đến khi người dùng xác nhận."), List.of(),
                List.of("Mở màn hình nghiệp vụ liên quan, kiểm tra dữ liệu, sau đó thao tác bằng quyền của bạn."),
                new AiDtos.ProposedAction("REQUIRES_USER_CONFIRMATION", "Cần xác nhận thủ công", "Không có thay đổi dữ liệu nào được thực hiện.", payload, true));
    }

    private AiDtos.AssistantResponse overview(Long branchId) {
        BigDecimal revenue = money("select coalesce(sum(total_amount),0) from sales_orders where status <> 'CANCELLED' and order_date >= ? and (? is null or branch_id = ?)", LocalDate.now().minusDays(30), branchId, branchId);
        BigDecimal lowStock = money("select count(*) from inventory_stocks where quantity_on_hand <= min_quantity and (? is null or branch_id = ?)", branchId, branchId);
        return response("OVERVIEW",
                "Tôi có thể trả lời nhanh về doanh thu, tồn kho, công nợ, bảo hành, KPI và cảnh báo bất thường. Trong 30 ngày gần đây doanh thu là " + formatMoney(revenue) + ".",
                List.of(metric("Doanh thu 30 ngày", revenue, "VND"), metric("Mặt hàng sắp hết", lowStock, "dòng")),
                List.of("AI chỉ hỗ trợ tham khảo, không thay thế phê duyệt nghiệp vụ."),
                List.of(link("Mở dashboard", "/dashboard")), quickQuestions(), null);
    }

    private AiDtos.AssistantResponse noPermission(String permission, String href) {
        return response("PROFIT_RESTRICTED",
                "Tài khoản hiện tại không có quyền " + permission + ", nên AI không hiển thị lợi nhuận/giá vốn.",
                List.of(), List.of("Dữ liệu nhạy cảm đã được ẩn theo phân quyền."),
                List.of(link("Mở báo cáo", href)), List.of(), null);
    }

    private AiDtos.AssistantResponse disabled() {
        return response("DISABLED", "AI Assistant đang tắt theo cấu hình hệ thống.",
                List.of(), List.of(), List.of(), List.of(), null);
    }

    // ─── Intent detection ────────────────────────────────────────────────────

    private String detectIntent(String question) {
        if ((question.contains("loi nhuan") || question.contains("lai")) && !hasAuthority("VIEW_PROFIT")) return "PROFIT_RESTRICTED";
        if (question.contains("gia von") && !hasAuthority("VIEW_COST_PRICE")) return "PROFIT_RESTRICTED";
        if (containsAny(question, "doanh thu hom nay", "hom nay bao nhieu", "so thang truoc", "doanh thu")) return "REVENUE_TODAY";
        if (containsAny(question, "chi nhanh nao ban tot", "ban tot nhat")) return "BEST_BRANCH";
        if (containsAny(question, "ton lau", "hang cham ban", "xe nao ton", "sap het", "ton dong")) return "SLOW_STOCK";
        if (containsAny(question, "no qua han", "cong no qua han", "don dang ton dong")) return "OVERDUE_DEBT";
        if (containsAny(question, "bao hanh nhieu", "loi nhieu")) return "WARRANTY_TOP_MODEL";
        if (containsAny(question, "ty le chot", "nhan vien nao")) return "EMPLOYEE_CONVERSION";
        if (containsAny(question, "goi y nhap", "can nhap", "nhap hang", "hang nao sap het")) return "PURCHASE_SUGGESTION";
        if (containsAny(question, "bat thuong", "canh bao", "giam gia qua", "ton kho am", "huy don nhieu")) return "ANOMALY";
        if (containsAny(question, "cham soc", "vip", "lau chua mua", "sap het bao hanh")) return "CUSTOMER_CARE";
        if (containsAny(question, "tao", "sua", "xoa", "huy don", "duyet", "lap phieu", "lap don")) return "ACTION_PROPOSAL";
        return "OVERVIEW";
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

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
                "Doanh thu so tháng trước?",
                "Đơn nào đang tồn đọng?",
                "Hàng nào sắp hết?",
                "Chi nhánh nào bán tốt nhất?",
                "Khách nào nợ quá hạn?",
                "Gợi ý nhập hàng không?"
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
        return java.text.Normalizer.normalize(lower, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
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
        return rows.stream()
                .map(row -> text(row, key, ""))
                .filter(value -> !value.isBlank())
                .limit(5)
                .reduce((left, right) -> left + ", " + right)
                .orElse("chưa có dữ liệu");
    }

    private String formatMoney(BigDecimal value) {
        return String.format(Locale.US, "%,.0f VND", value == null ? BigDecimal.ZERO : value);
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(item -> authority.equals(item.getAuthority()));
    }

    private void audit(String question, String intent, String answer) {
        try {
            auditLogService.record(new CreateAuditLogRequest(
                    currentUsername(), AuditAction.AI_ASSISTANT_QUERY, AuditModule.SYSTEM,
                    "AIAssistant", intent, sanitize(question), sanitize(answer), null, null));
        } catch (Exception e) {
            log.debug("Audit log failed: {}", e.getMessage());
        }
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
