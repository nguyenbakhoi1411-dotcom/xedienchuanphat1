package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public class VatOffsetPreviewDto {
    private BigDecimal inputVatAmount;
    private BigDecimal outputVatAmount;
    private BigDecimal offsetAmount;
    private BigDecimal payableAmount;
    private BigDecimal carriedForward;

    public VatOffsetPreviewDto() {}

    public VatOffsetPreviewDto(BigDecimal inputVatAmount, BigDecimal outputVatAmount, 
                               BigDecimal offsetAmount, BigDecimal payableAmount, 
                               BigDecimal carriedForward) {
        this.inputVatAmount = inputVatAmount;
        this.outputVatAmount = outputVatAmount;
        this.offsetAmount = offsetAmount;
        this.payableAmount = payableAmount;
        this.carriedForward = carriedForward;
    }

    public BigDecimal getInputVatAmount() { return inputVatAmount; }
    public void setInputVatAmount(BigDecimal inputVatAmount) { this.inputVatAmount = inputVatAmount; }
    public BigDecimal getOutputVatAmount() { return outputVatAmount; }
    public void setOutputVatAmount(BigDecimal outputVatAmount) { this.outputVatAmount = outputVatAmount; }
    public BigDecimal getOffsetAmount() { return offsetAmount; }
    public void setOffsetAmount(BigDecimal offsetAmount) { this.offsetAmount = offsetAmount; }
    public BigDecimal getPayableAmount() { return payableAmount; }
    public void setPayableAmount(BigDecimal payableAmount) { this.payableAmount = payableAmount; }
    public BigDecimal getCarriedForward() { return carriedForward; }
    public void setCarriedForward(BigDecimal carriedForward) { this.carriedForward = carriedForward; }
}
