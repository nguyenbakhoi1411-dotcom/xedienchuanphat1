package com.chuanphat.warranty.cash.entity;

public enum PaymentType {
    PURCHASE,   // Chi mua hàng       → Nợ TK 156
    SALARY,     // Chi lương          → Nợ TK 334
    OPERATING,  // Chi phí vận hành   → Nợ TK 642
    REFUND,     // Chi hoàn trả       → Nợ TK 131
    OTHER       // Chi khác           → Nợ TK 811
}
