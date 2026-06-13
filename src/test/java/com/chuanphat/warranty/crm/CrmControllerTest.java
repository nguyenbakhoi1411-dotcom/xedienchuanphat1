package com.chuanphat.warranty.crm;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class CrmControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void leadCanConvertToCustomerAndOpportunity() throws Exception {
        long leadId = createLead("CRM Lead Convert", "0988000001");

        mockMvc.perform(post("/api/crm/leads/{id}/convert-opportunity", leadId)
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "expectedValue", new BigDecimal("25000000"),
                                "expectedCloseDate", LocalDate.now().plusDays(10).toString(),
                                "stage", "CONSULTING",
                                "probability", 25,
                                "assignedTo", 102
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leadId").value(leadId))
                .andExpect(jsonPath("$.stage").value("CONSULTING"));

        mockMvc.perform(post("/api/crm/leads/{id}/convert-customer", leadId)
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "assignedTo", 102,
                                "email", "crm-lead@example.com",
                                "address", "TP.HCM"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("0988000001"))
                .andExpect(jsonPath("$.tier").value("NEW"));
    }

    @Test
    void taskNoteAndReportsAreAvailable() throws Exception {
        MvcResult customerResult = mockMvc.perform(post("/api/crm/leads/{id}/convert-customer", createLead("CRM Care", "0988000002"))
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("branchId", 1))))
                .andExpect(status().isOk())
                .andReturn();
        long customerId = objectMapper.readTree(customerResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/crm/customers/{customerId}/notes", customerId)
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", "Goi cham soc sau ban hang", "createdBy", "sales1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customerId));

        MvcResult taskResult = mockMvc.perform(post("/api/crm/tasks")
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "customerId", customerId,
                                "title", "Nhac bao duong",
                                "content", "Hen lich bao duong dinh ky",
                                "type", "MAINTENANCE",
                                "dueDate", LocalDate.now().plusDays(30).toString(),
                                "assignedTo", 102
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TODO"))
                .andReturn();
        long taskId = objectMapper.readTree(taskResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/crm/tasks/{id}/status", taskId)
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "DONE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));

        mockMvc.perform(get("/api/customers/{id}/360", customerId).with(crmUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes[0].content").value("Goi cham soc sau ban hang"));

        mockMvc.perform(get("/api/crm/reports").with(crmUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leadConversionRate").exists());
    }

    private long createLead(String name, String phone) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/crm/leads")
                        .with(crmUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "leadName", name,
                                "phone", phone,
                                "source", "FACEBOOK",
                                "interestedProduct", "CP S1",
                                "assignedTo", 102,
                                "status", "NEW",
                                "note", "Lead test"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private RequestPostProcessor crmUser() {
        return user("sales1").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("CUSTOMER_VIEW"),
                new SimpleGrantedAuthority("CUSTOMER_CREATE"),
                new SimpleGrantedAuthority("CUSTOMER_UPDATE"),
                new SimpleGrantedAuthority("SALES_VIEW"),
                new SimpleGrantedAuthority("SALES_CREATE"),
                new SimpleGrantedAuthority("SALES_UPDATE"),
                new SimpleGrantedAuthority("REPORT_VIEW")
        ));
    }
}
