package com.chuanphat.warranty.marketing.dto;

import com.chuanphat.warranty.marketing.enums.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PromotionCalculateResponse {
    @Builder.Default
    private List<PromotionApplied> promotionsApplied = new ArrayList<>();
    
    @Builder.Default
    private BigDecimal tongGiam = BigDecimal.ZERO;
    
    private BigDecimal tongSauKM;
    
    @Builder.Default
    private List<PromotionNotApplied> khongApDung = new ArrayList<>();

                    public static class PromotionApplied {
        private Long promotionId;
        private String tenKM;
        private PromotionType loaiKM;
        private BigDecimal soTienGiam;
        private GiftProduct spTang;
    
        public PromotionApplied() {}
        public Long getPromotionId() { return promotionId; }
        public void setPromotionId(Long promotionId) { this.promotionId = promotionId; }
        public String getTenKM() { return tenKM; }
        public void setTenKM(String tenKM) { this.tenKM = tenKM; }
        public PromotionType getLoaiKM() { return loaiKM; }
        public void setLoaiKM(PromotionType loaiKM) { this.loaiKM = loaiKM; }
        public BigDecimal getSoTienGiam() { return soTienGiam; }
        public void setSoTienGiam(BigDecimal soTienGiam) { this.soTienGiam = soTienGiam; }
        public GiftProduct getSpTang() { return spTang; }
        public void setSpTang(GiftProduct spTang) { this.spTang = spTang; }
        public PromotionApplied(Long promotionId, String tenKM, PromotionType loaiKM, BigDecimal soTienGiam, GiftProduct spTang) { this.promotionId = promotionId; this.tenKM = tenKM; this.loaiKM = loaiKM; this.soTienGiam = soTienGiam; this.spTang = spTang; }
        public static PromotionAppliedBuilder builder() { return new PromotionAppliedBuilder(); }
        public static class PromotionAppliedBuilder {
            private Long promotionId;
            private String tenKM;
            private PromotionType loaiKM;
            private BigDecimal soTienGiam;
            private GiftProduct spTang;
            public PromotionAppliedBuilder promotionId(Long promotionId) { this.promotionId = promotionId; return this; }
            public PromotionAppliedBuilder tenKM(String tenKM) { this.tenKM = tenKM; return this; }
            public PromotionAppliedBuilder loaiKM(PromotionType loaiKM) { this.loaiKM = loaiKM; return this; }
            public PromotionAppliedBuilder soTienGiam(BigDecimal soTienGiam) { this.soTienGiam = soTienGiam; return this; }
            public PromotionAppliedBuilder spTang(GiftProduct spTang) { this.spTang = spTang; return this; }
            public PromotionApplied build() { return new PromotionApplied(promotionId, tenKM, loaiKM, soTienGiam, spTang); }
        }
}

                    public static class GiftProduct {
        private Long id;
        private String ten;
        private BigDecimal soLuong;
    
        public GiftProduct() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTen() { return ten; }
        public void setTen(String ten) { this.ten = ten; }
        public BigDecimal getSoLuong() { return soLuong; }
        public void setSoLuong(BigDecimal soLuong) { this.soLuong = soLuong; }
        public GiftProduct(Long id, String ten, BigDecimal soLuong) { this.id = id; this.ten = ten; this.soLuong = soLuong; }
        public static GiftProductBuilder builder() { return new GiftProductBuilder(); }
        public static class GiftProductBuilder {
            private Long id;
            private String ten;
            private BigDecimal soLuong;
            public GiftProductBuilder id(Long id) { this.id = id; return this; }
            public GiftProductBuilder ten(String ten) { this.ten = ten; return this; }
            public GiftProductBuilder soLuong(BigDecimal soLuong) { this.soLuong = soLuong; return this; }
            public GiftProduct build() { return new GiftProduct(id, ten, soLuong); }
        }
}

                    public static class PromotionNotApplied {
        private Long promotionId;
        private String tenKM;
        private String lyDo;
    
        public PromotionNotApplied() {}
        public Long getPromotionId() { return promotionId; }
        public void setPromotionId(Long promotionId) { this.promotionId = promotionId; }
        public String getTenKM() { return tenKM; }
        public void setTenKM(String tenKM) { this.tenKM = tenKM; }
        public String getLyDo() { return lyDo; }
        public void setLyDo(String lyDo) { this.lyDo = lyDo; }
        public PromotionNotApplied(Long promotionId, String tenKM, String lyDo) { this.promotionId = promotionId; this.tenKM = tenKM; this.lyDo = lyDo; }
        public static PromotionNotAppliedBuilder builder() { return new PromotionNotAppliedBuilder(); }
        public static class PromotionNotAppliedBuilder {
            private Long promotionId;
            private String tenKM;
            private String lyDo;
            public PromotionNotAppliedBuilder promotionId(Long promotionId) { this.promotionId = promotionId; return this; }
            public PromotionNotAppliedBuilder tenKM(String tenKM) { this.tenKM = tenKM; return this; }
            public PromotionNotAppliedBuilder lyDo(String lyDo) { this.lyDo = lyDo; return this; }
            public PromotionNotApplied build() { return new PromotionNotApplied(promotionId, tenKM, lyDo); }
        }
}

    public PromotionCalculateResponse() {}
    public List<PromotionApplied> getPromotionsApplied() { return promotionsApplied; }
    public void setPromotionsApplied(List<PromotionApplied> promotionsApplied) { this.promotionsApplied = promotionsApplied; }
    public BigDecimal getTongGiam() { return tongGiam; }
    public void setTongGiam(BigDecimal tongGiam) { this.tongGiam = tongGiam; }
    public BigDecimal getTongSauKM() { return tongSauKM; }
    public void setTongSauKM(BigDecimal tongSauKM) { this.tongSauKM = tongSauKM; }
    public List<PromotionNotApplied> getKhongApDung() { return khongApDung; }
    public void setKhongApDung(List<PromotionNotApplied> khongApDung) { this.khongApDung = khongApDung; }
    public PromotionCalculateResponse(List<PromotionApplied> promotionsApplied, BigDecimal tongGiam, BigDecimal tongSauKM, List<PromotionNotApplied> khongApDung) { this.promotionsApplied = promotionsApplied; this.tongGiam = tongGiam; this.tongSauKM = tongSauKM; this.khongApDung = khongApDung; }
    public static PromotionCalculateResponseBuilder builder() { return new PromotionCalculateResponseBuilder(); }
    public static class PromotionCalculateResponseBuilder {
        private List<PromotionApplied> promotionsApplied;
        private BigDecimal tongGiam;
        private BigDecimal tongSauKM;
        private List<PromotionNotApplied> khongApDung;
        public PromotionCalculateResponseBuilder promotionsApplied(List<PromotionApplied> promotionsApplied) { this.promotionsApplied = promotionsApplied; return this; }
        public PromotionCalculateResponseBuilder tongGiam(BigDecimal tongGiam) { this.tongGiam = tongGiam; return this; }
        public PromotionCalculateResponseBuilder tongSauKM(BigDecimal tongSauKM) { this.tongSauKM = tongSauKM; return this; }
        public PromotionCalculateResponseBuilder khongApDung(List<PromotionNotApplied> khongApDung) { this.khongApDung = khongApDung; return this; }
        public PromotionCalculateResponse build() { return new PromotionCalculateResponse(promotionsApplied, tongGiam, tongSauKM, khongApDung); }
    }
}
