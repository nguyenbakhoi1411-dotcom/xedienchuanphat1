package com.chuanphat.warranty.crm.enums;

/** Hạng khách hàng theo yêu cầu mới (thay thế/bổ sung CustomerTier) */
public enum CustomerRank {
    NEW,        // Mới, chưa phát sinh giao dịch
    POTENTIAL,  // Tiềm năng (đang ở lead/opportunity)
    NORMAL,     // Bình thường, đã mua hàng
    VIP,        // VIP >= 20tr LTV
    INACTIVE    // Không hoạt động > 180 ngày
}
