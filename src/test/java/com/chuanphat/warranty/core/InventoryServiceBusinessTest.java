package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryExportRequest;
import com.chuanphat.warranty.core.dto.InventoryImportRequest;
import com.chuanphat.warranty.core.dto.InventoryMutationRequest;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.InventoryMutationType;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.InventoryMutationService;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.ProductService;
import com.chuanphat.warranty.core.service.WarehouseAccessService;
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
    @Mock InventoryTransactionRepository transactionRepository;
    @Mock InventoryAverageCostRepository averageCostRepository;
    @Mock WarehouseRepository warehouseRepository;
    @Mock ProductService productService;
    @Mock BranchSecurity branchSecurity;
    @Mock WarehouseAccessService warehouseAccessService;
    @Mock InventoryMutationService mutationService;

    private InventoryService service;
    private Product product;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        service = new InventoryService(transactionRepository, averageCostRepository, warehouseRepository,
                productService, branchSecurity, warehouseAccessService, mutationService);
        product = product(7L);
        warehouse = warehouse(3L, 2L);
    }

    @Test
    void importStockDelegatesQuantityAndLedgerToMutationService() {
        when(productService.get(7L)).thenReturn(product);
        when(warehouseRepository.findById(3L)).thenReturn(Optional.of(warehouse));
        when(mutationService.apply(any())).thenReturn(transaction(InventoryTransactionType.IMPORT));

        service.importStock(new InventoryImportRequest(2L, 3L, 7L, 5, new BigDecimal("1100000"), LocalDate.of(2026, 6, 13), "opening"));

        ArgumentCaptor<InventoryMutationRequest> captor = ArgumentCaptor.forClass(InventoryMutationRequest.class);
        verify(mutationService).apply(captor.capture());
        assertThat(captor.getValue().deltaQuantity()).isEqualTo(5);
        assertThat(captor.getValue().transactionType()).isEqualTo(InventoryMutationType.IMPORT);
        assertThat(captor.getValue().referenceType()).isEqualTo("INVENTORY_IMPORT");
    }

    @Test
    void exportStockDelegatesNegativeDeltaToMutationService() {
        when(productService.get(7L)).thenReturn(product);
        when(warehouseRepository.findById(3L)).thenReturn(Optional.of(warehouse));
        when(mutationService.apply(any())).thenReturn(transaction(InventoryTransactionType.EXPORT));

        service.exportStock(new InventoryExportRequest(2L, 3L, 7L, 2, LocalDate.now(), "usage"));

        ArgumentCaptor<InventoryMutationRequest> captor = ArgumentCaptor.forClass(InventoryMutationRequest.class);
        verify(mutationService).apply(captor.capture());
        assertThat(captor.getValue().deltaQuantity()).isEqualTo(-2);
        assertThat(captor.getValue().transactionType()).isEqualTo(InventoryMutationType.EXPORT);
    }

    private InventoryTransaction transaction(InventoryTransactionType type) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setType(type);
        transaction.setProduct(product);
        transaction.setTransactionDate(LocalDate.now());
        transaction.setQuantity(2);
        transaction.setUnitCost(BigDecimal.ONE);
        transaction.setTotalCost(BigDecimal.valueOf(2));
        return transaction;
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
}
