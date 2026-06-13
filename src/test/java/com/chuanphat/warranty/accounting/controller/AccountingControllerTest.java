package com.chuanphat.warranty.accounting.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@SpringBootTest
@AutoConfigureMockMvc
class AccountingControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void paidSalesOrderCreatesCashFlowReceivableAndProfitLoss() throws Exception {
        long bankAccountId = createBankAccount("979900001");

        mockMvc.perform(post("/api/accounting/sales-payments")
                        .with(withPermissions("accountant", "RECEIPT_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "salesOrderNo", "SO-ACC-001",
                                "saleDate", "2027-03-01",
                                "customerId", 501,
                                "customerName", "Nguyen Van A",
                                "totalAmount", new BigDecimal("1000.00"),
                                "paidAmount", new BigDecimal("300.00"),
                                "costAmount", new BigDecimal("650.00"),
                                "paymentMethod", "BANK_TRANSFER",
                                "bankAccountId", bankAccountId,
                                "description", "Paid sales order"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remainingDebt").value(700.00));

        mockMvc.perform(get("/api/accounting/customers/{customerId}/debt", 501)
                        .with(withPermissions("accountant", "ACCOUNTING_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(700.00));

        mockMvc.perform(post("/api/accounting/receipts")
                        .with(withPermissions("manager", "RECEIPT_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "voucherNo", "PT-ACC-001",
                                "receiptDate", "2027-03-02",
                                "customerId", 501,
                                "customerName", "Nguyen Van A",
                                "amount", new BigDecimal("200.00"),
                                "paymentMethod", "BANK_TRANSFER",
                                "bankAccountId", bankAccountId,
                                "sourceNo", "SO-ACC-001",
                                "reason", "Collect remaining debt"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remainingDebt").value(500.00));

        mockMvc.perform(get("/api/accounting/reports/cash-flow")
                        .param("fromDate", "2027-03-01")
                        .param("toDate", "2027-03-31")
                        .with(withPermissions("accountant", "ACCOUNTING_VIEW", "ACCOUNTING_REPORT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cashIn").value(500.00))
                .andExpect(jsonPath("$.netCashFlow").value(500.00));

        mockMvc.perform(get("/api/accounting/reports/profit-loss")
                        .param("fromDate", "2027-03-01")
                        .param("toDate", "2027-03-31")
                        .with(withPermissions("accountant", "ACCOUNTING_VIEW", "ACCOUNTING_REPORT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revenue").value(1000.00))
                .andExpect(jsonPath("$.costOfGoodsSold").value(650.00))
                .andExpect(jsonPath("$.netProfit").value(350.00));
    }

    @Test
    void purchaseDebtAndSupplierPaymentUpdatePayable() throws Exception {
        long bankAccountId = createBankAccount("979900002");

        mockMvc.perform(post("/api/accounting/purchase-debts")
                        .with(withPermissions("accountant", "PAYMENT_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "purchaseOrderNo", "PO-ACC-001",
                                "purchaseDate", "2026-04-01",
                                "supplierId", 701,
                                "supplierName", "NCC Phu Tung",
                                "totalAmount", new BigDecimal("800.00"),
                                "description", "Purchase stock"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remainingDebt").value(800.00));

        mockMvc.perform(post("/api/accounting/payments")
                        .with(withPermissions("accountant", "PAYMENT_CREATE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "voucherNo", "PC-ACC-001",
                                "paymentDate", "2026-04-02",
                                "supplierId", 701,
                                "supplierName", "NCC Phu Tung",
                                "amount", new BigDecimal("300.00"),
                                "paymentMethod", "BANK_TRANSFER",
                                "bankAccountId", bankAccountId,
                                "sourceNo", "PO-ACC-001",
                                "reason", "Pay supplier"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remainingDebt").value(500.00));

        mockMvc.perform(get("/api/accounting/suppliers/{supplierId}/debt", 701)
                        .with(withPermissions("manager", "ACCOUNTING_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(500.00));
    }

    @Test
    void userCannotCreateReceipt() throws Exception {
        mockMvc.perform(post("/api/accounting/receipts")
                        .with(withPermissions("user", "DASHBOARD_VIEW"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "voucherNo", "PT-DENIED",
                                "receiptDate", LocalDate.now().toString(),
                                "customerId", 1,
                                "customerName", "Denied",
                                "amount", new BigDecimal("10.00"),
                                "paymentMethod", "CASH",
                                "reason", "Denied"
                        ))))
                .andExpect(status().isForbidden());
    }

    private long createBankAccount(String accountNumber) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/accounting/bank-accounts")
                        .with(withPermissions("manager", "ACCOUNTING_VIEW"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "bankName", "VCB",
                                "accountNumber", accountNumber,
                                "accountHolder", "Chuan Phat",
                                "openingBalance", new BigDecimal("10000.00")
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private RequestPostProcessor withPermissions(String username, String... permissions) {
        return user(username).authorities(
                java.util.stream.Stream.concat(
                        java.util.stream.Stream.of(new SimpleGrantedAuthority("ROLE_USER")),
                        java.util.Arrays.stream(permissions).map(SimpleGrantedAuthority::new)
                ).toList()
        );
    }
}
