package com.chuanphat.warranty.reports;

import static org.assertj.core.api.Assertions.assertThat;

import com.chuanphat.warranty.common.security.BranchSecurity;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class ReportSecurityBusinessTest {
    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @SuppressWarnings("unchecked")
    void hidesCostAndProfitWithoutPermissionAndRevealsWithPermission() throws Exception {
        ReportService service = new ReportService(org.mockito.Mockito.mock(JdbcTemplate.class), org.mockito.Mockito.mock(BranchSecurity.class), org.mockito.Mockito.mock(ExportDocumentService.class));
        Method method = ReportService.class.getDeclaredMethod("maskSensitive", Map.class);
        method.setAccessible(true);
        Map<String, Object> report = Map.of(
                "tableColumns", List.of(Map.of("key", "revenue"), Map.of("key", "unitCost"), Map.of("key", "grossProfit")),
                "tableRows", List.of(Map.of("revenue", new BigDecimal("100"), "unitCost", new BigDecimal("60"), "grossProfit", new BigDecimal("40"))),
                "chart", List.of(Map.of("label", "Today", "value", 100, "secondaryValue", 40)),
                "secondaryChartLabel", "Loi nhuan"
        );

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("sales", "n/a", List.of()));
        Map<String, Object> masked = (Map<String, Object>) method.invoke(service, report);
        assertThat((List<Map<String, String>>) masked.get("tableColumns")).extracting(row -> row.get("key")).containsExactly("revenue");
        assertThat((Map<String, Object>) ((List<?>) masked.get("tableRows")).get(0)).containsOnlyKeys("revenue");
        assertThat((Map<String, Object>) ((List<?>) masked.get("chart")).get(0)).doesNotContainKey("secondaryValue");
        assertThat(masked).doesNotContainKey("secondaryChartLabel");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("director", "n/a", List.of(
                new SimpleGrantedAuthority("VIEW_COST_PRICE"),
                new SimpleGrantedAuthority("VIEW_PROFIT")
        )));
        Map<String, Object> visible = (Map<String, Object>) method.invoke(service, report);
        assertThat((List<Map<String, String>>) visible.get("tableColumns")).extracting(row -> row.get("key")).contains("unitCost", "grossProfit");
    }
}
