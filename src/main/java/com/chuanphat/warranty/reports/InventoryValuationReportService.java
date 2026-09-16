package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.reports.dto.InventoryValuationReportDtos;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryValuationReportService {
    public static final String COSTING_METHOD = "WEIGHTED_AVERAGE";

    private final InventoryStockRepository inventoryStockRepository;
    private final InventoryAverageCostRepository inventoryAverageCostRepository;

    public InventoryValuationReportService(
            InventoryStockRepository inventoryStockRepository,
            InventoryAverageCostRepository inventoryAverageCostRepository
    ) {
        this.inventoryStockRepository = inventoryStockRepository;
        this.inventoryAverageCostRepository = inventoryAverageCostRepository;
    }

    @Transactional(readOnly = true)
    public InventoryValuationReportDtos.InventoryValuationReportResponse report() {
        Map<AverageCostKey, InventoryAverageCost> averageCosts = inventoryAverageCostRepository.findAll().stream()
                .collect(Collectors.toMap(this::key, Function.identity(), (first, ignored) -> first));

        List<InventoryValuationReportDtos.InventoryValuationWarehouseRow> rows = inventoryStockRepository.findAll().stream()
                .map(stock -> row(stock, averageCosts.get(key(stock))))
                .sorted(Comparator.comparing((InventoryValuationReportDtos.InventoryValuationWarehouseRow row) -> row.warehouseName() == null ? "" : row.warehouseName())
                        .thenComparing(row -> row.productCode() == null ? "" : row.productCode()))
                .toList();
        BigDecimal totalValue = rows.stream()
                .map(InventoryValuationReportDtos.InventoryValuationWarehouseRow::stockValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new InventoryValuationReportDtos.InventoryValuationReportResponse(COSTING_METHOD, totalValue, rows);
    }

    private InventoryValuationReportDtos.InventoryValuationWarehouseRow row(InventoryStock stock, InventoryAverageCost averageCost) {
        BigDecimal unitCost = averageCost == null ? BigDecimal.ZERO : money(averageCost.getAverageCost());
        BigDecimal stockValue = unitCost.multiply(BigDecimal.valueOf(stock.getQuantityOnHand()));
        return new InventoryValuationReportDtos.InventoryValuationWarehouseRow(
                stock.getWarehouse() == null ? null : stock.getWarehouse().getId(),
                stock.getWarehouse() == null ? "UNASSIGNED" : stock.getWarehouse().getWarehouseName(),
                stock.getProduct() == null ? null : stock.getProduct().getId(),
                stock.getProduct() == null ? null : stock.getProduct().getProductCode(),
                stock.getProduct() == null ? null : stock.getProduct().getCategory(),
                stock.getQuantityOnHand(),
                unitCost,
                stockValue
        );
    }

    private AverageCostKey key(InventoryStock stock) {
        return new AverageCostKey(
                stock.getBranchId(),
                stock.getWarehouse() == null ? null : stock.getWarehouse().getId(),
                stock.getProduct() == null ? null : stock.getProduct().getId()
        );
    }

    private AverageCostKey key(InventoryAverageCost averageCost) {
        return new AverageCostKey(
                averageCost.getBranchId(),
                averageCost.getWarehouse() == null ? null : averageCost.getWarehouse().getId(),
                averageCost.getProduct() == null ? null : averageCost.getProduct().getId()
        );
    }

    private static BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private record AverageCostKey(Long branchId, Long warehouseId, Long productId) {
    }
}
