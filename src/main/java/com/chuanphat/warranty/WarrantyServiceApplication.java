package com.chuanphat.warranty;

import com.chuanphat.warranty.core.config.PurchaseReceiptProperties;
import com.chuanphat.warranty.operations.SystemOperationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({SystemOperationProperties.class, PurchaseReceiptProperties.class})
public class WarrantyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(WarrantyServiceApplication.class, args);
    }
}
