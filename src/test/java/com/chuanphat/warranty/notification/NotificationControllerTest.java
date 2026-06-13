package com.chuanphat.warranty.notification;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
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
class NotificationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationService notificationService;

    @Test
    void notificationCanBeListedAndMarkedRead() throws Exception {
        notificationService.notifyAllOnce(
                "LOW_STOCK_TEST",
                NotificationSeverity.WARNING,
                "INVENTORY",
                9001L,
                "Ton kho thap",
                "San pham test con duoi dinh muc"
        );

        MvcResult listResult = mockMvc.perform(get("/api/notifications")
                        .param("limit", "10")
                        .with(adminUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.items[0].title").exists())
                .andReturn();

        JsonNode json = objectMapper.readTree(listResult.getResponse().getContentAsString());
        long notificationId = json.get("items").get(0).get("id").asLong();

        mockMvc.perform(patch("/api/notifications/{id}/read", notificationId).with(adminUser()))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/notifications/read-all").with(adminUser()))
                .andExpect(status().isOk());
    }

    @Test
    void reminderCanBeCreatedListedAndCompleted() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/reminders")
                        .with(adminUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "reminderDate", LocalDate.now().toString(),
                                "customerId", 101,
                                "type", "CALL_CUSTOMER",
                                "title", "Goi khach test",
                                "note", "Nhac lich cham soc"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        long reminderId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/reminders")
                        .param("status", "PENDING")
                        .with(adminUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].title").exists());

        mockMvc.perform(get("/api/customers/{customerId}/reminders", 101).with(adminUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(101));

        mockMvc.perform(patch("/api/reminders/{id}/done", reminderId).with(adminUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    private RequestPostProcessor adminUser() {
        return user("admin").authorities(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("CUSTOMER_VIEW")
        );
    }
}
