package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryExportRequest;
import com.chuanphat.warranty.core.dto.InventoryImportRequest;
import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.ProductService;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceBusinessTest {
    @Mock InventoryStockRepository stockRepository;
    @Mock InventoryTransactionRepository transactionRepository;
    @Mock InventoryAverageCostRepository averageCostRepository;
    @Mock WarehouseRepository warehouseRepository;
    @Mock ProductService productService;
    @Mock BranchSecurity branchSecurity;

    InventoryService service;
    Product product;
    Warehouse warehouse;

    @BeforeEach
    void setUp() {
        service = new InventoryService(stockRepository, transactionRepository, averageCostRepository, warehouseRepository, productService, branchSecurity);
        product = product(7L);
        warehouse = warehouse(3L, 2L);
    }

    @Test
    void importStockCreatesStockAndAverageCost() {
        when(productService.get(7L)).thenReturn(product);
        when(warehouseRepository.findById(3L)).thenReturn(Optional.of(warehouse));
        when(stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(2L, 3L, 7L)).thenReturn(Optional.empty());
        when(averageCostRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(2L, 3L, 7L)).thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.importStock(new InventoryImportRequest(2L, 3L, 7L, 5, new BigDecimal("1100000"), LocalDate.of(2026, 6, 13), "initial"));

        ArgumentCaptor<InventoryStock> stockCaptor = ArgumentCaptor.forClass(InventoryStock.class);
        verify(stockRepository).save(stockCaptor.capture());
        assertThat(stockCaptor.getValue().getQuantityOnHand()).isEqualTo(5);

        ArgumentCaptor<InventoryAverageCost> costCaptor = ArgumentCaptor.forClass(InventoryAverageCost.class);
        verify(averageCostRepository).save(costCaptor.capture());
        assertThat(costCaptor.getValue().getAverageCost()).isEqualByComparingTo("1100000.00");
    }

    @Test
    void exportStockRejectsNegativeInventoryAndRecordsExportWhenEnoughStock() {
        InventoryStock lowStock = stock(product, warehouse, 1, 0);
        when(productService.get(7L)).thenReturn(product);
        when(warehouseRepository.findById(3L)).thenReturn(Optional.of(warehouse));
        when(averageCostRepository.findByBranchIdAndWarehouseIdAndProductId(2L, 3L, 7L)).thenReturn(Optional.empty());
        when(stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(2L, 3L, 7L)).thenReturn(Optional.of(lowStock));

        assertThatThrownBy(() -> service.exportStock(new InventoryExportRequest(2L, 3L, 7L, 2, LocalDate.now(), "sale")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Not enough stock");

        InventoryStock enoughStock = stock(product, warehouse, 3, 0);
        when(stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(2L, 3L, 7L)).thenReturn(Optional.of(enoughStock));
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.exportStock(new InventoryExportRequest(2L, 3L, 7L, 2, LocalDate.now(), "sale"));

        assertThat(enoughStock.getQuantityOnHand()).isEqualTo(1);
        ArgumentCaptor<InventoryTransaction> transactionCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(transactionRepository).save(transactionCaptor.capture());
        assertThat(transactionCaptor.getValue().getType()).isEqualTo(InventoryTransactionType.EXPORT);
    }

    private Product product(Long id) {
        Product product = withId(new Product(), id);
        product.setProductCode("SP-" + id);
        product.setProductName("San pham " + id);
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("CP");
        product.setImportPrice(new BigDecimal("1000000"));
        product.setSalePrice(new BigDecimal("1500000"));
        return product;
    }

    private Warehouse warehouse(Long id, Long branchId) {
        Warehouse warehouse = withId(new Warehouse(), id);
        warehouse.setBranchId(branchId);
        warehouse.setWarehouseCode("WH-" + id);
        warehouse.setWarehouseName("Kho " + id);
        warehouse.setType(WarehouseType.MAIN);
        warehouse.setStatus(RecordStatus.ACTIVE);
        return warehouse;
    }

    private InventoryStock stock(Product product, Warehouse warehouse, int onHand, int reserved) {
        InventoryStock stock = new InventoryStock();
        stock.setBranchId(warehouse.getBranchId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(onHand);
        stock.setReservedQuantity(reserved);
        return stock;
    }
}
