package com.chuanphat.warranty.sales.dto;
import java.util.List;
import org.springframework.data.domain.Page;
public record ProductCatalogListResponse(
    Long lowStockCount, Long outOfStockCount,
    Page<ProductStockResponse> products
) {}
