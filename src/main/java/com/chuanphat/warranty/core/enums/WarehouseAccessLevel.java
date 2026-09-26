package com.chuanphat.warranty.core.enums;

public enum WarehouseAccessLevel {
    VIEW,
    OPERATE,
    MANAGE;

    public boolean allows(WarehouseAccessLevel required) {
        return ordinal() >= required.ordinal();
    }
}
