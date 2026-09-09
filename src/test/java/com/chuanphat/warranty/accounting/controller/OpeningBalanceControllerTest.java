package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.entity.AccountingPeriod;
import com.chuanphat.warranty.accounting.enums.AccountingPeriodStatus;
import com.chuanphat.warranty.accounting.repository.AccountingPeriodRepository;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
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
class OpeningBalanceControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountingPeriodRepository periodRepository;

    @Autowired
    private BranchRepository branchRepository;

    private AccountingPeriod testPeriod;
    private Branch testBranch;

    @BeforeEach
    void setUp() {
        // Fetch or create branch
        testBranch = branchRepository.findAll().stream().findFirst().orElseGet(() -> {
            Branch b = new Branch();
            b.setCode("TEST_BR");
            b.setName("Test Branch");
            b.setAddress("Test Address");
            return branchRepository.save(b);
        });

        // Fetch or create period
        testPeriod = periodRepository.findAll().stream().findFirst().orElseGet(() -> {
            AccountingPeriod p = new AccountingPeriod();
            p.setPeriodCode("PE_TEST");
            p.setMonth(6);
            p.setQuarter(2);
            p.setYear(2026);
            p.setStartDate(LocalDate.of(2026, 6, 1));
            p.setEndDate(LocalDate.of(2026, 6, 30));
            p.setStatus(AccountingPeriodStatus.OPEN);
            p.setBranchId(testBranch.getId());
            p.setCreatedBy("admin");
            return periodRepository.save(p);
        });
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"OPENING_BALANCE_MANAGE"})
    void testBulkUpsertAndLockOpeningBalances() throws Exception {
        // 1. Bulk Upsert
        Map<String, Object> row1 = Map.of(
                "periodId", testPeriod.getId(),
                "accountCode", "111",
                "debitBalance", BigDecimal.valueOf(1000),
                "creditBalance", BigDecimal.ZERO,
                "note", "Tiền mặt đầu kỳ",
                "branchId", testBranch.getId()
        );
        Map<String, Object> row2 = Map.of(
                "periodId", testPeriod.getId(),
                "accountCode", "331",
                "debitBalance", BigDecimal.ZERO,
                "creditBalance", BigDecimal.valueOf(1000),
                "note", "Phải trả NCC đầu kỳ",
                "branchId", testBranch.getId()
        );

        mockMvc.perform(post("/api/v1/accounting/opening-balances")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(row1, row2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        // 2. Fetch
        mockMvc.perform(get("/api/v1/accounting/opening-balances")
                        .param("periodId", testPeriod.getId().toString())
                        .param("branchId", testBranch.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // 3. Lock
        Map<String, Object> lockPayload = Map.of("periodId", testPeriod.getId());
        mockMvc.perform(post("/api/v1/accounting/opening-balances/lock")
                        .param("branchId", testBranch.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockPayload)))
                .andExpect(status().isOk());
    }
}
