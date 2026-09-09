package com.chuanphat.warranty.marketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class PromotionCalculateRequest {
    private Long customerId;
    private List<CartItem> items;
    private BigDecimal tongTienHang;

                public static class CartItem {
        private Long sanPhamId;
        private BigDecimal soLuong;
        private BigDecimal donGia;
    
        public CartItem() {}
        public Long getSanPhamId() { return sanPhamId; }
        public void setSanPhamId(Long sanPhamId) { this.sanPhamId = sanPhamId; }
        public BigDecimal getSoLuong() { return soLuong; }
        public void setSoLuong(BigDecimal soLuong) { this.soLuong = soLuong; }
        public BigDecimal getDonGia() { return donGia; }
        public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }
        public CartItem(Long sanPhamId, BigDecimal soLuong, BigDecimal donGia) { this.sanPhamId = sanPhamId; this.soLuong = soLuong; this.donGia = donGia; }
        public static CartItemBuilder builder() { return new CartItemBuilder(); }
        public static class CartItemBuilder {
            private Long sanPhamId;
            private BigDecimal soLuong;
            private BigDecimal donGia;
            public CartItemBuilder sanPhamId(Long sanPhamId) { this.sanPhamId = sanPhamId; return this; }
            public CartItemBuilder soLuong(BigDecimal soLuong) { this.soLuong = soLuong; return this; }
            public CartItemBuilder donGia(BigDecimal donGia) { this.donGia = donGia; return this; }
            public CartItem build() { return new CartItem(sanPhamId, soLuong, donGia); }
        }
}

    public PromotionCalculateRequest() {}
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
    public BigDecimal getTongTienHang() { return tongTienHang; }
    public void setTongTienHang(BigDecimal tongTienHang) { this.tongTienHang = tongTienHang; }
    public PromotionCalculateRequest(Long customerId, List<CartItem> items, BigDecimal tongTienHang) { this.customerId = customerId; this.items = items; this.tongTienHang = tongTienHang; }
    public static PromotionCalculateRequestBuilder builder() { return new PromotionCalculateRequestBuilder(); }
    public static class PromotionCalculateRequestBuilder {
        private Long customerId;
        private List<CartItem> items;
        private BigDecimal tongTienHang;
        public PromotionCalculateRequestBuilder customerId(Long customerId) { this.customerId = customerId; return this; }
        public PromotionCalculateRequestBuilder items(List<CartItem> items) { this.items = items; return this; }
        public PromotionCalculateRequestBuilder tongTienHang(BigDecimal tongTienHang) { this.tongTienHang = tongTienHang; return this; }
        public PromotionCalculateRequest build() { return new PromotionCalculateRequest(customerId, items, tongTienHang); }
    }
}
