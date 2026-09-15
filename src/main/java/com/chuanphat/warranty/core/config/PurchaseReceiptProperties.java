package com.chuanphat.warranty.core.config;

import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.purchase.receipt")
public class PurchaseReceiptProperties {
    private BigDecimal foodOverReceiptTolerancePercent = BigDecimal.ZERO;

    public BigDecimal getFoodOverReceiptTolerancePercent() {
        return foodOverReceiptTolerancePercent;
    }

    public void setFoodOverReceiptTolerancePercent(BigDecimal foodOverReceiptTolerancePercent) {
        this.foodOverReceiptTolerancePercent = foodOverReceiptTolerancePercent == null
                ? BigDecimal.ZERO
                : foodOverReceiptTolerancePercent;
    }
}
