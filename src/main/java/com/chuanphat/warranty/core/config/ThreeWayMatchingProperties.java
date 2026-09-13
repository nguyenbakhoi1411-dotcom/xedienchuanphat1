package com.chuanphat.warranty.core.config;

import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.purchase.three-way-match")
public class ThreeWayMatchingProperties {
    private BigDecimal priceTolerancePercent = new BigDecimal("2");

    public BigDecimal getPriceTolerancePercent() {
        return priceTolerancePercent;
    }

    public void setPriceTolerancePercent(BigDecimal priceTolerancePercent) {
        this.priceTolerancePercent = priceTolerancePercent == null ? BigDecimal.ZERO : priceTolerancePercent;
    }
}
