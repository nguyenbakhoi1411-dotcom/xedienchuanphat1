package com.chuanphat.warranty.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class WarrantyServiceProfessionalTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void paidRepairRequiresQuotationApprovalAndCreatesServiceInvoice() throws Exception {
        mockMvc.perform(post("/api/warranties/policies")
                        .with(serviceUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "policyName", "Bao hanh xe dien tieu chuan",
                                "productCategory", "ELECTRIC_MOTORBIKE",
                                "warrantyMonths", 24,
                                "batteryWarrantyMonths", 18,
                                "motorWarrantyMonths", 24,
                                "includedParts", "Xe, pin, dong co, sac",
                                "excludedCases", "Vo nuoc, tai nan, tu y do che",
                                "laborFeePolicy", "Mien phi cong trong thoi han bao hanh"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batteryWarrantyMonths").value(18));

        MvcResult ticketResult = mockMvc.perform(post("/api/service-tickets")
                        .with(serviceUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "vehicleId", 1,
                                "serialNumber", "CP26-001-00001",
                                "customerName", "Khach sua tinh phi",
                                "phone", "0900000009",
                                "issueDescription", "Xe khong nhan sac",
                                "beforeRepairImages", "before-1.jpg",
                                "warrantyRepair", false
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andReturn();
        long ticketId = objectMapper.readTree(ticketResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/service-tickets/{id}/diagnosis", ticketId)
                        .with(serviceUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "diagnosisNote", "Da kiem tra bo sac va cong sac",
                                "predictedCause", "Hong cong sac",
                                "warrantyRepair", false
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("QUOTED"));

        mockMvc.perform(post("/api/service-tickets/{id}/items", ticketId)
                        .with(serviceUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "LABOR",
                                "name", "Cong thay cong sac",
                                "quantity", 1,
                                "unitPrice", new BigDecimal("250000"),
                                "unitCost", BigDecimal.ZERO
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.laborCost").value(250000));

        mockMvc.perform(post("/api/service-tickets/{id}/quotation", ticketId)
                        .with(serviceUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("note", "Bao gia cong sua"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_CUSTOMER"));

        mockMvc.perform(post("/api/service-tickets/{id}/quotation/approve", ticketId).with(serviceUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(patch("/api/service-tickets/{id}/status", ticketId)
                        .with(serviceUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "REPAIRING"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REPAIRING"));

        mockMvc.perform(post("/api/service-tickets/{id}/invoice", ticketId).with(serviceUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ISSUED"));

        mockMvc.perform(get("/api/service-tickets/reports").with(serviceUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.repairRevenue").exists());
    }

    private RequestPostProcessor serviceUser() {
        return user("manager1").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("WARRANTY_VIEW"),
                new SimpleGrantedAuthority("WARRANTY_MANAGE"),
                new SimpleGrantedAuthority("REPORT_VIEW")
        ));
    }
}
