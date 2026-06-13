package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.enums.ServiceTicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(@NotNull ServiceTicketStatus status) {
}
