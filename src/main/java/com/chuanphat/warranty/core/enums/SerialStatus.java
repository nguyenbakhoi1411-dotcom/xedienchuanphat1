package com.chuanphat.warranty.core.enums;

/**
 * Trang thai cua serial xe dien.
 *
 * Enum cu giu nguyen de khong break data DB.
 * Them moi:
 *   REPAIRING            — Dang sua chua (thay the SERVICE)
 *   DEFECTIVE            — Bi loi/hu (thay the DAMAGED)
 *   RETURNED_TO_SUPPLIER — Da tra lai nha cung cap
 *   TRANSFERRED          — Da chuyen kho/chi nhanh (thay the TRANSFERING)
 */
public enum SerialStatus {
    // ── Trang thai chinh ──
    IN_STOCK,           // Co trong kho (trang thai mac dinh sau nhap hang)
    RESERVED,           // Da dat coc / giu cho khach
    SOLD,               // Da ban cho khach
    WARRANTY,           // Dang trong bao hanh
    RETURNED,           // Da hoan tra (tu khach)

    // ── Trang thai van hanh ──
    SERVICE,            // Dang sua chua (enum cu, giu lai cho data hien co)
    REPAIRING,          // Dang sua chua (ten moi chuan)
    TRANSFERING,        // Dang chuyen kho (enum cu, giu lai)
    TRANSFERRED,        // Da chuyen kho/chi nhanh xong

    // ── Trang thai dac biet ──
    DAMAGED,            // Xe bi hu (enum cu)
    DEFECTIVE,          // Xe bi loi/khong dat chuan (ten moi)
    RETURNED_TO_SUPPLIER // Da tra lai nha cung cap
}
