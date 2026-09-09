package com.chuanphat.warranty.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class DefaultAIInsightServiceUnitTest {
    private JdbcTemplate jdbcTemplate;
    private BranchSecurity branchSecurity;
    private DefaultAIInsightService service;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        branchSecurity = mock(BranchSecurity.class);
        service = new DefaultAIInsightService(jdbcTemplate, branchSecurity, mock(AuditLogService.class), true, "mock", "");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "sales",
                "n/a",
                java.util.List.of(new SimpleGrantedAuthority("AI_ASSISTANT_USE"))
        ));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void userWithoutProfitPermissionCannotAskProfit() {
        when(branchSecurity.scopedBranchId(1L)).thenReturn(1L);

        AiDtos.AssistantResponse response = service.ask(new AiDtos.AssistantRequest("Loi nhuan thang nay bao nhieu?", 1L));

        assertThat(response.intent()).isEqualTo("PROFIT_RESTRICTED");
        assertThat(response.answer()).contains("khong co quyen");
        verify(jdbcTemplate, never()).queryForObject(any(String.class), any(Class.class), any(Object[].class));
    }

    @Test
    void branchAccessIsEnforcedBeforeAnswering() {
        when(branchSecurity.scopedBranchId(2L)).thenThrow(new AccessDeniedException("Cannot access data from another branch"));

        assertThatThrownBy(() -> service.ask(new AiDtos.AssistantRequest("Doanh thu hom nay bao nhieu?", 2L)))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void writeIntentCreatesProposalOnly() {
        when(branchSecurity.scopedBranchId(1L)).thenReturn(1L);

        AiDtos.AssistantResponse response = service.ask(new AiDtos.AssistantRequest("Tao don hang moi cho khach nay", 1L));

        assertThat(response.proposedAction()).isNotNull();
        assertThat(response.proposedAction().requiresConfirmation()).isTrue();
        verify(jdbcTemplate, never()).update(any(String.class), any(Object[].class));
    }
}
