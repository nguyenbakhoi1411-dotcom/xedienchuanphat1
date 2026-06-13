package com.chuanphat.warranty.controller;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@SpringBootTest
@AutoConfigureMockMvc
class WarrantyServiceApiTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void branchManagerCanCreateAndTechnicianCanCheckWarranty() throws Exception {
        long vehicleId = 61;
        String serialNumber = seededSerial(vehicleId);

        mockMvc.perform(post("/api/warranties")
                        .with(withPermissions("manager1", "WARRANTY_MANAGE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "serialNumber", serialNumber,
                                "vehicleId", vehicleId,
                                "customerName", "Nguyen Van A",
                                "purchaseDate", LocalDate.now().toString(),
                                "startDate", LocalDate.now().toString(),
                                "endDate", LocalDate.now().plusYears(1).toString()
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.serialNumber").value(serialNumber))
                .andExpect(jsonPath("$.valid").value(true));

        mockMvc.perform(get("/api/warranties/{serialNumber}", serialNumber)
                        .with(withPermissions("technician1", "WARRANTY_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
    }

    @Test
    void technicianCannotCreateWarranty() throws Exception {
        mockMvc.perform(post("/api/warranties")
                        .with(withPermissions("tech", "WARRANTY_VIEW"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "serialNumber", seededSerial(2),
                                "vehicleId", 2,
                                "customerName", "Nguyen Van B",
                                "purchaseDate", LocalDate.now().toString(),
                                "startDate", LocalDate.now().toString(),
                                "endDate", LocalDate.now().plusYears(1).toString()
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void serviceTicketFlowCalculatesRepairCost() throws Exception {
        long ticketId = createTicket(61);

        mockMvc.perform(patch("/api/service-tickets/{ticketId}/technician", ticketId)
                        .with(withPermissions("manager1", "WARRANTY_MANAGE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("technicianUsername", "tech"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.technicianUsername").value("tech"));

        mockMvc.perform(post("/api/service-tickets/{ticketId}/items", ticketId)
                        .with(withPermissions("technician1", "WARRANTY_MANAGE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "PART",
                                "name", "Battery",
                                "quantity", 2,
                                "unitPrice", 100.50
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCost").value(201.00));

        mockMvc.perform(get("/api/service-tickets/{ticketId}/cost", ticketId)
                        .with(withPermissions("technician1", "WARRANTY_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCost").value(201.00));
    }

    @Test
    void technicianCannotAssignTechnician() throws Exception {
        long ticketId = createTicket(67);

        mockMvc.perform(patch("/api/service-tickets/{ticketId}/technician", ticketId)
                        .with(withPermissions("technician1", "WARRANTY_VIEW"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("technicianUsername", "tech2"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void canViewVehicleRepairHistory() throws Exception {
        createTicket(73);

        mockMvc.perform(get("/api/service-tickets/vehicles/{vehicleId}/history", 73)
                        .with(withPermissions("manager1", "WARRANTY_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vehicleId").value(73));
    }

    private long createTicket(long vehicleId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/service-tickets")
                        .with(withPermissions("manager1", "WARRANTY_MANAGE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "vehicleId", vehicleId,
                                "serialNumber", seededSerial(vehicleId),
                                "customerName", "Nguyen Van C",
                                "issueDescription", "Cannot start"
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private String seededSerial(long vehicleId) {
        long productNo = ((vehicleId - 1) % 30) + 1;
        return "CP26-" + String.format("%03d", productNo) + "-" + String.format("%05d", vehicleId);
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
