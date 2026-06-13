package com.chuanphat.warranty.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignTechnicianRequest(@NotBlank String technicianUsername) {
}
