package com.chuanphat.warranty.marketing.dto;

import com.chuanphat.warranty.marketing.enums.CustomerGroupStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPriceGroupDTO {
    private Long id;
    private String maNhomGia;
    private String tenNhomGia;
    private Long priceListId;
    private String priceListName;
    private BigDecimal dieuKienMinOrder;
    private BigDecimal dieuKienMinCum;
    private String mauSac;
    private String moTa;
    private CustomerGroupStatus trangThai;
    
    // Additional fields
    private long soLuongKhachHang;
    public static CustomerPriceGroupDTOBuilder builder() { return new CustomerPriceGroupDTOBuilder(); }
    public static class CustomerPriceGroupDTOBuilder {
        private CustomerPriceGroupDTO g = new CustomerPriceGroupDTO();
        public CustomerPriceGroupDTO build() { return g; }
    }
    public Long getPriceListId() { return priceListId; }
    public String getMaNhomGia() { return maNhomGia; }
    public String getTenNhomGia() { return tenNhomGia; }
    public java.math.BigDecimal getDieuKienMinOrder() { return dieuKienMinOrder; }
    public java.math.BigDecimal getDieuKienMinCum() { return dieuKienMinCum; }
    public String getMauSac() { return mauSac; }
    public String getMoTa() { return moTa; }
}

