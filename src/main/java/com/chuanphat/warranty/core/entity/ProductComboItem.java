package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_combo_items")
public class ProductComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_product_id", nullable = false)
    private Product comboProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detail_product_id", nullable = false)
    private Product detailProduct;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal quantity;

    @Column(length = 50)
    private String unit;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getComboProduct() {
        return comboProduct;
    }

    public void setComboProduct(Product comboProduct) {
        this.comboProduct = comboProduct;
    }

    public Product getDetailProduct() {
        return detailProduct;
    }

    public void setDetailProduct(Product detailProduct) {
        this.detailProduct = detailProduct;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
