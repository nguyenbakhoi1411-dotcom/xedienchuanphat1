package com.chuanphat.warranty.core.enums;

/**
 * Loai kho hang.
 * V19: Them DISPLAY, WARRANTY_STORE, DEFECTIVE_STORE, STAGING, SPARE_PARTS.
 */
public enum WarehouseType {
    MAIN,            // Kho chinh ban hang
    SERVICE,         // Kho sua chua / bao hanh (cu)
    RETURN,          // Kho hang hoan tra (cu)
    DAMAGED,         // Kho hang hu (cu)
    DISPLAY,         // Kho trung bay
    WARRANTY_STORE,  // Kho hang trong bao hanh
    DEFECTIVE_STORE, // Kho hang loi / sap xu ly
    STAGING,         // Kho cho xuat
    SPARE_PARTS      // Kho phu tung
}
