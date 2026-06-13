package com.chuanphat.warranty.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record UserStatusRequest(@NotBlank String status) {
}
