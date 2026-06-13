package com.chuanphat.warranty.core.dto;

import java.time.OffsetDateTime;

public record SalesOrderStatusRequest(
        OffsetDateTime reservationUntil,
        String reason
) {
}
