package com.chuanphat.warranty.crm.enums;

public enum CustomerTier {
    NEW,
    REGULAR,    // thay thế NORMAL — >= 5tr LTV
    VIP,        // >= 20tr LTV
    PLATINUM,   // >= 50tr LTV
    WHOLESALE,  // khách mua sỉ (gán thủ công)
    HIGH_RISK_DEBT  // khách nợ xấu (gán thủ công)
}
