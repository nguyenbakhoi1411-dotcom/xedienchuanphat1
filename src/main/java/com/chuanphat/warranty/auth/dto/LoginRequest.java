package com.chuanphat.warranty.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String identifier,
        @NotBlank String password,
        boolean rememberMe
) {
}
