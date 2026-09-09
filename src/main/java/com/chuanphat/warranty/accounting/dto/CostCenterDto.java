package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.CostCenter;
import com.chuanphat.warranty.core.enums.RecordStatus;

public record CostCenterDto(
        Long id,
        String code,
        String name,
        String description,
        RecordStatus status
) {
    public static CostCenterDto from(CostCenter cc) {
        if (cc == null) return null;
        return new CostCenterDto(
                cc.getId(),
                cc.getCode(),
                cc.getName(),
                cc.getDescription(),
                cc.getStatus()
        );
    }
}
