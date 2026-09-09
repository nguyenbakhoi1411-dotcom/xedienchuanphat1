package com.chuanphat.warranty.auth.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest(properties = {
        "app.security.bootstrap-admin.enabled=true",
        "app.security.bootstrap-admin.username=admin",
        "app.security.bootstrap-admin.password=TEST_ONLY_ADMIN_PASSWORD",
        "app.security.bootstrap-admin.email=admin@chuanphat.vn",
        "app.security.bootstrap-admin.full-name=Admin Chuan Phat"
})
@AutoConfigureMockMvc
class AuthSecurityUpgradeTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void refreshTokenIsRotatedAndOldTokenCannotBeReused() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "identifier", "admin",
                                "password", "TEST_ONLY_ADMIN_PASSWORD",
                                "rememberMe", false
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        String firstRefreshToken = objectMapper.readTree(login.getResponse().getContentAsString()).get("refreshToken").asText();

        MvcResult refresh = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", firstRefreshToken))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode refreshBody = objectMapper.readTree(refresh.getResponse().getContentAsString());
        String secondRefreshToken = refreshBody.get("refreshToken").asText();
        org.assertj.core.api.Assertions.assertThat(secondRefreshToken).isNotEqualTo(firstRefreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", firstRefreshToken))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminCannotCreateUserWithWeakPassword() throws Exception {
        mockMvc.perform(post("/api/users")
                        .with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "employeeCode", "weak_pw_001",
                                "fullName", "Weak Password",
                                "email", "weak_pw_001@chuanphat.vn",
                                "phone", "0999000099",
                                "branchIds", List.of(1),
                                "roles", List.of("USER"),
                                "status", "ACTIVE",
                                "password", "password123"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password is too weak"));
    }

    @Test
    void securityHeadersAreReturned() throws Exception {
        mockMvc.perform(get("/api/auth/me").with(admin()))
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Security-Policy"))
                .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().exists("Referrer-Policy"));
    }

    private RequestPostProcessor admin() {
        return user("admin").authorities(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("USER_CREATE")
        );
    }
}
