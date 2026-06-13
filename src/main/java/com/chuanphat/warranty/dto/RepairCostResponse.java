package com.chuanphat.warranty.dto;

import java.math.BigDecimal;

public record RepairCostResponse(Long ticketId, BigDecimal totalCost) {
}
