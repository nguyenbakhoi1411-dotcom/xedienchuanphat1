package com.chuanphat.warranty.accounting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AccountingLedgerControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = {"ACCOUNTING_CREATE", "ACCOUNTING_POST", "ACCOUNTING_REPORT", "ACCOUNTING_VIEW"})
    void rejectsUnbalancedJournalEntry() throws Exception {
        Map<String, Object> payload = Map.of(
                "entryDate", LocalDate.now().toString(),
                "referenceType", "MANUAL",
                "description", "Unbalanced entry",
                "lines", List.of(
                        Map.of("accountCode", "111", "debitAmount", BigDecimal.valueOf(100), "creditAmount", BigDecimal.ZERO),
                        Map.of("accountCode", "511", "debitAmount", BigDecimal.ZERO, "creditAmount", BigDecimal.valueOf(90))
                )
        );

        mockMvc.perform(post("/api/accounting/journal-entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = {"ACCOUNTING_CREATE", "ACCOUNTING_POST", "ACCOUNTING_REPORT", "ACCOUNTING_VIEW"})
    void createsPostsAndReportsBalancedJournalEntry() throws Exception {
        Map<String, Object> payload = Map.of(
                "entryDate", LocalDate.now().toString(),
                "referenceType", "MANUAL",
                "description", "Manual balanced entry",
                "lines", List.of(
                        Map.of("accountCode", "111", "debitAmount", BigDecimal.valueOf(100), "creditAmount", BigDecimal.ZERO),
                        Map.of("accountCode", "511", "debitAmount", BigDecimal.ZERO, "creditAmount", BigDecimal.valueOf(100))
                )
        );

        String response = mockMvc.perform(post("/api/accounting/journal-entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();
        mockMvc.perform(post("/api/accounting/journal-entries/{id}/post", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("POSTED"))
                .andExpect(jsonPath("$.totalDebit").value(100))
                .andExpect(jsonPath("$.totalCredit").value(100));

        mockMvc.perform(get("/api/accounting/reports/trial-balance")
                        .param("fromDate", LocalDate.now().minusDays(1).toString())
                        .param("toDate", LocalDate.now().plusDays(1).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDebit").value(100))
                .andExpect(jsonPath("$.totalCredit").value(100));
    }
}
