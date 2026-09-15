package com.chuanphat.warranty.core;

import static org.assertj.core.api.Assertions.assertThat;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.SupplierCategory;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test")
class PurchaseOrderDataModelPersistenceTest {

    @Autowired SupplierRepository supplierRepository;
    @Autowired WarehouseRepository warehouseRepository;
    @Autowired ProductRepository productRepository;
    @Autowired PurchaseOrderRepository purchaseOrderRepository;
    @Autowired TestEntityManager entityManager;

    @Test
    void purchaseOrderWithMultipleItemsPersistsAndReadsBackData() {
        Supplier supplier = supplierRepository.save(supplier("NCC-FOOD-01", SupplierCategory.FOOD_SUPPLIER));
        Warehouse warehouse = warehouseRepository.save(warehouse("WH-PO-01", 10L));
        Product rice = productRepository.save(product("FOOD-001", ProductCategory.ACCESSORY));
        Product charger = productRepository.save(product("EV-ACC-001", ProductCategory.SPARE_PART));

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setPoCode("PO-PR1-0001");
        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setBranchId(10L);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setStatus(PurchaseOrderStatus.DRAFT);
        purchaseOrder.setOrderDate(LocalDate.of(2026, 9, 11));
        purchaseOrder.setExpectedDeliveryDate(LocalDate.of(2026, 9, 14));
        purchaseOrder.setCreatedBy("buyer-a");
        purchaseOrder.addItem(item(rice, 12, "145000"));
        purchaseOrder.addItem(item(charger, 3, "320000"));
        purchaseOrder.setTotalAmount(new BigDecimal("2700000"));

        PurchaseOrder saved = purchaseOrderRepository.saveAndFlush(purchaseOrder);
        entityManager.clear();

        PurchaseOrder reloaded = purchaseOrderRepository.findById(saved.getId()).orElseThrow();

        assertThat(reloaded.getPoCode()).isEqualTo("PO-PR1-0001");
        assertThat(reloaded.getSupplier().getCategory()).isEqualTo(SupplierCategory.FOOD_SUPPLIER);
        assertThat(reloaded.getSupplier().getBankAccountNumber()).isEqualTo("0123456789");
        assertThat(reloaded.getSupplier().getDefaultPaymentTermDays()).isEqualTo(21);
        assertThat(reloaded.getWarehouseId()).isEqualTo(warehouse.getId());
        assertThat(reloaded.getOrderDate()).isEqualTo(LocalDate.of(2026, 9, 11));
        assertThat(reloaded.getExpectedDeliveryDate()).isEqualTo(LocalDate.of(2026, 9, 14));
        assertThat(reloaded.getStatus()).isEqualTo(PurchaseOrderStatus.DRAFT);
        assertThat(reloaded.getItems()).hasSize(2);
        assertThat(reloaded.getItems())
                .extracting(PurchaseOrderItem::getReceivedQuantity)
                .containsExactly(0, 0);
        assertThat(reloaded.getItems())
                .extracting(PurchaseOrderItem::getUnitPrice)
                .containsExactly(new BigDecimal("145000.00"), new BigDecimal("320000.00"));
    }

    private Supplier supplier(String code, SupplierCategory category) {
        Supplier supplier = new Supplier();
        supplier.setCode(code);
        supplier.setName("Nha cung cap " + code);
        supplier.setTaxCode("0312345678");
        supplier.setAddress("Quan 1, TP HCM");
        supplier.setContactPerson("Nguyen Van A");
        supplier.setContactPhone("0909000000");
        supplier.setCategory(category);
        supplier.setBankAccountNumber("0123456789");
        supplier.setBankName("VCB");
        supplier.setDefaultPaymentTermDays(21);
        supplier.setStatus(RecordStatus.ACTIVE);
        return supplier;
    }

    private Warehouse warehouse(String code, Long branchId) {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseCode(code);
        warehouse.setWarehouseName("Kho nhan PO");
        warehouse.setBranchId(branchId);
        warehouse.setType(WarehouseType.MAIN);
        warehouse.setStatus(RecordStatus.ACTIVE);
        return warehouse;
    }

    private Product product(String code, ProductCategory category) {
        Product product = new Product();
        product.setProductCode(code);
        product.setProductName("San pham " + code);
        product.setCategory(category);
        product.setBrand("CP");
        product.setImportPrice(new BigDecimal("100000"));
        product.setSalePrice(new BigDecimal("150000"));
        product.setWarrantyMonths(12);
        product.setStatus(RecordStatus.ACTIVE);
        return product;
    }

    private PurchaseOrderItem item(Product product, int quantity, String unitPrice) {
        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(new BigDecimal(unitPrice));
        item.setLineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(quantity)));
        return item;
    }
}
