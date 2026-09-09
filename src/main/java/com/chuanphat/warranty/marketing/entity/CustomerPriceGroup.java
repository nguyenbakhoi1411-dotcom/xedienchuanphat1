package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.marketing.enums.CustomerGroupStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "customer_price_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerPriceGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_nhom_gia", length = 30, nullable = false, unique = true)
    private String maNhomGia;

    @Column(name = "ten_nhom_gia", nullable = false)
    private String tenNhomGia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Column(name = "dieu_kien_min_order", precision = 18, scale = 0)
    @Builder.Default
    private BigDecimal dieuKienMinOrder = BigDecimal.ZERO;

    @Column(name = "dieu_kien_min_cum", precision = 18, scale = 0)
    @Builder.Default
    private BigDecimal dieuKienMinCum = BigDecimal.ZERO;

    @Column(name = "mau_sac", length = 20)
    @Builder.Default
    private String mauSac = "#3B82F6";

    @Column(columnDefinition = "TEXT")
    private String moTa;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private CustomerGroupStatus trangThai = CustomerGroupStatus.ACTIVE;
    public static CustomerPriceGroupBuilder builder() { return new CustomerPriceGroupBuilder(); }
    public static class CustomerPriceGroupBuilder {
        private CustomerPriceGroup g = new CustomerPriceGroup();
        public CustomerPriceGroupBuilder id(Long id) { g.id = id; return this; }
        public CustomerPriceGroupBuilder maNhomGia(String ma) { g.maNhomGia = ma; return this; }
        public CustomerPriceGroupBuilder tenNhomGia(String ten) { g.tenNhomGia = ten; return this; }
        public CustomerPriceGroupBuilder mauSac(String m) { g.mauSac = m; return this; }
        public CustomerPriceGroupBuilder moTa(String m) { g.moTa = m; return this; }
        public CustomerPriceGroupBuilder dieuKienMinOrder(java.math.BigDecimal val) { g.dieuKienMinOrder = val; return this; }
        public CustomerPriceGroupBuilder dieuKienMinCum(java.math.BigDecimal val) { g.dieuKienMinCum = val; return this; }
        public CustomerPriceGroupBuilder priceList(PriceList pl) { g.priceList = pl; return this; }
        public CustomerPriceGroup build() { return g; }
    }
    public Long getId() { return id; }
    public PriceList getPriceList() { return priceList; }
    public java.math.BigDecimal getDieuKienMinCum() { return dieuKienMinCum; }
}

