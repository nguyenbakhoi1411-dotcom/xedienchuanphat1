package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.SalesOrder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotion_usage", indexes = {
        @Index(name = "idx_promo_usage_kh", columnList = "khach_hang_id, promotion_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_hang_id", nullable = false)
    private Customer khachHang;

    @Column(name = "so_tien_giam", nullable = false, precision = 18, scale = 0)
    private BigDecimal soTienGiam;

    @Column(name = "sp_tang_da_xuat")
    @Builder.Default
    private Boolean spTangDaXuat = false;

    @CreationTimestamp
    @Column(name = "ngay_su_dung", updatable = false)
    private LocalDateTime ngaySuDung;
}
