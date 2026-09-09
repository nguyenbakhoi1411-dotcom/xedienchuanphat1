package com.chuanphat.warranty.auth.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class ErpPermissionControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void adminCanCreateUserWithMultipleRolesAndBranches() throws Exception {
        mockMvc.perform(post("/api/users")
                        .with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "employeeCode", "erp_multi_001",
                                "fullName", "ERP Multi Role",
                                "email", "erp_multi_001@chuanphat.vn",
                                "phone", "0999000001",
                                "branchIds", List.of(1, 2),
                                "branchAccesses", List.of(
                                        Map.of("branchId", 1, "accessLevel", "MANAGE"),
                                        Map.of("branchId", 2, "accessLevel", "VIEW")
                                ),
                                "roles", List.of("SALES_STAFF", "WAREHOUSE_STAFF"),
                                "status", "ACTIVE",
                                "password", "ChangeMe@123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles.length()").value(2))
                .andExpect(jsonPath("$.branchIds.length()").value(2))
                .andExpect(jsonPath("$.branchAccesses[?(@.accessLevel == 'VIEW')]").exists());
    }

    @Test
    void adminCanSaveRolePermissionMatrixCodes() throws Exception {
        mockMvc.perform(put("/api/roles/USER/permissions")
                        .with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "permissions", List.of("PRODUCT_VIEW", "REPORT_EXPORT", "SETTING_MANAGE")
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permissions[?(@ == 'PRODUCT_VIEW')]").exists())
                .andExpect(jsonPath("$.permissions[?(@ == 'REPORT_EXPORT')]").exists())
                .andExpect(jsonPath("$.permissions[?(@ == 'SETTING_MANAGE')]").exists());
    }

    @Test
    void userCannotReadAnotherBranchInventory() throws Exception {
        mockMvc.perform(get("/api/inventory/stocks")
                        .param("branchId", "2")
                        .with(user("sales1").authorities(
                                new SimpleGrantedAuthority("ROLE_USER"),
                                new SimpleGrantedAuthority("INVENTORY_VIEW")
                        )))
                .andExpect(status().isForbidden());
    }

    private RequestPostProcessor admin() {
        return user("admin").authorities(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("USER_CREATE"),
                new SimpleGrantedAuthority("MANAGE_PERMISSIONS"),
                new SimpleGrantedAuthority("ROLE_UPDATE"),
                new SimpleGrantedAuthority("ROLE_VIEW")
        );
    }
}
