package com.chuanphat.warranty.marketing.dto;

import com.chuanphat.warranty.marketing.enums.PriceAdjustmentRounding;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentScope;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreatePriceAdjustmentRequest {
    private String tenDieuChinh;
    private Long priceListId;
    private PriceAdjustmentScope phamVi;
    private List<Long> categoryIds;
    private List<Long> productIds;
    private PriceAdjustmentType kieuDieuChinh;
    private BigDecimal giaTri;
    private PriceAdjustmentRounding lamTron;
    private LocalDate apDungTu;
    private LocalDate apDungDen;
    private String ghiChu;

    public CreatePriceAdjustmentRequest() {}
    public String getTenDieuChinh() { return tenDieuChinh; }
    public void setTenDieuChinh(String tenDieuChinh) { this.tenDieuChinh = tenDieuChinh; }
    public Long getPriceListId() { return priceListId; }
    public void setPriceListId(Long priceListId) { this.priceListId = priceListId; }
    public PriceAdjustmentScope getPhamVi() { return phamVi; }
    public void setPhamVi(PriceAdjustmentScope phamVi) { this.phamVi = phamVi; }
    public List<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; }
    public List<Long> getProductIds() { return productIds; }
    public void setProductIds(List<Long> productIds) { this.productIds = productIds; }
    public PriceAdjustmentType getKieuDieuChinh() { return kieuDieuChinh; }
    public void setKieuDieuChinh(PriceAdjustmentType kieuDieuChinh) { this.kieuDieuChinh = kieuDieuChinh; }
    public BigDecimal getGiaTri() { return giaTri; }
    public void setGiaTri(BigDecimal giaTri) { this.giaTri = giaTri; }
    public PriceAdjustmentRounding getLamTron() { return lamTron; }
    public void setLamTron(PriceAdjustmentRounding lamTron) { this.lamTron = lamTron; }
    public LocalDate getApDungTu() { return apDungTu; }
    public void setApDungTu(LocalDate apDungTu) { this.apDungTu = apDungTu; }
    public LocalDate getApDungDen() { return apDungDen; }
    public void setApDungDen(LocalDate apDungDen) { this.apDungDen = apDungDen; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
    public CreatePriceAdjustmentRequest(String tenDieuChinh, Long priceListId, PriceAdjustmentScope phamVi, List<Long> categoryIds, List<Long> productIds, PriceAdjustmentType kieuDieuChinh, BigDecimal giaTri, PriceAdjustmentRounding lamTron, LocalDate apDungTu, LocalDate apDungDen, String ghiChu) { this.tenDieuChinh = tenDieuChinh; this.priceListId = priceListId; this.phamVi = phamVi; this.categoryIds = categoryIds; this.productIds = productIds; this.kieuDieuChinh = kieuDieuChinh; this.giaTri = giaTri; this.lamTron = lamTron; this.apDungTu = apDungTu; this.apDungDen = apDungDen; this.ghiChu = ghiChu; }
    public static CreatePriceAdjustmentRequestBuilder builder() { return new CreatePriceAdjustmentRequestBuilder(); }
    public static class CreatePriceAdjustmentRequestBuilder {
        private String tenDieuChinh;
        private Long priceListId;
        private PriceAdjustmentScope phamVi;
        private List<Long> categoryIds;
        private List<Long> productIds;
        private PriceAdjustmentType kieuDieuChinh;
        private BigDecimal giaTri;
        private PriceAdjustmentRounding lamTron;
        private LocalDate apDungTu;
        private LocalDate apDungDen;
        private String ghiChu;
        public CreatePriceAdjustmentRequestBuilder tenDieuChinh(String tenDieuChinh) { this.tenDieuChinh = tenDieuChinh; return this; }
        public CreatePriceAdjustmentRequestBuilder priceListId(Long priceListId) { this.priceListId = priceListId; return this; }
        public CreatePriceAdjustmentRequestBuilder phamVi(PriceAdjustmentScope phamVi) { this.phamVi = phamVi; return this; }
        public CreatePriceAdjustmentRequestBuilder categoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; return this; }
        public CreatePriceAdjustmentRequestBuilder productIds(List<Long> productIds) { this.productIds = productIds; return this; }
        public CreatePriceAdjustmentRequestBuilder kieuDieuChinh(PriceAdjustmentType kieuDieuChinh) { this.kieuDieuChinh = kieuDieuChinh; return this; }
        public CreatePriceAdjustmentRequestBuilder giaTri(BigDecimal giaTri) { this.giaTri = giaTri; return this; }
        public CreatePriceAdjustmentRequestBuilder lamTron(PriceAdjustmentRounding lamTron) { this.lamTron = lamTron; return this; }
        public CreatePriceAdjustmentRequestBuilder apDungTu(LocalDate apDungTu) { this.apDungTu = apDungTu; return this; }
        public CreatePriceAdjustmentRequestBuilder apDungDen(LocalDate apDungDen) { this.apDungDen = apDungDen; return this; }
        public CreatePriceAdjustmentRequestBuilder ghiChu(String ghiChu) { this.ghiChu = ghiChu; return this; }
        public CreatePriceAdjustmentRequest build() { return new CreatePriceAdjustmentRequest(tenDieuChinh, priceListId, phamVi, categoryIds, productIds, kieuDieuChinh, giaTri, lamTron, apDungTu, apDungDen, ghiChu); }
    }
}

