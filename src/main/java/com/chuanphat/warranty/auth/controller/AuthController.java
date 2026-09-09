package com.chuanphat.warranty.auth.controller;

import com.chuanphat.warranty.auth.dto.AuthUserResponse;
import com.chuanphat.warranty.auth.dto.ForgotPasswordRequest;
import com.chuanphat.warranty.auth.dto.ForgotPasswordResponse;
import com.chuanphat.warranty.auth.dto.LoginRequest;
import com.chuanphat.warranty.auth.dto.LoginResponse;
import com.chuanphat.warranty.auth.dto.LogoutRequest;
import com.chuanphat.warranty.auth.dto.RefreshTokenRequest;
import com.chuanphat.warranty.auth.dto.ResetPasswordRequest;
import com.chuanphat.warranty.auth.service.AuthService;
import com.chuanphat.warranty.security.PublicEndpoint;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@PublicEndpoint
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return authService.login(request, clientIp(httpRequest), httpRequest.getHeader("User-Agent"));
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        return authService.refresh(request, clientIp(httpRequest), httpRequest.getHeader("User-Agent"));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@Valid @RequestBody LogoutRequest request, HttpServletRequest httpRequest) {
        authService.logout(request.refreshToken(), clientIp(httpRequest), httpRequest.getHeader("User-Agent"));
        return Map.of("message", "Logged out");
    }

    @GetMapping("/me")
    public AuthUserResponse me(Authentication authentication) {
        return authService.me(authentication);
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        return authService.forgotPassword(request, clientIp(httpRequest), httpRequest.getHeader("User-Agent"));
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest httpRequest) {
        authService.resetPassword(request, clientIp(httpRequest), httpRequest.getHeader("User-Agent"));
        return Map.of("message", "Password reset successfully");
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
