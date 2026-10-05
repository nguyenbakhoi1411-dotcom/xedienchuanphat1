package com.chuanphat.warranty.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.RoleRepository;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.entity.GoodsIssue;
import com.chuanphat.warranty.core.entity.GoodsIssueItem;
import com.chuanphat.warranty.core.entity.InventoryCount;
import com.chuanphat.warranty.core.entity.InventoryCountItem;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.GoodsIssueType;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.chuanphat.warranty.core.repository.GoodsIssueRepository;
import com.chuanphat.warranty.core.repository.InventoryCountRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.GoodsIssueService;
import com.chuanphat.warranty.core.service.InventoryCountService;
import com.chuanphat.warranty.core.service.PurchaseReceiptService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("dev")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:inventory-mutation-workflows;MODE=PostgreSQL;DATABASE_TO_UPPER=false;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.sql.init.mode=never",
        "spring.flyway.enabled=false"
})
class InventoryMutationWorkflowIntegrationTest {
    @Autowired BranchRepository branchRepository;
    @Autowired WarehouseRepository warehouseRepository;
    @Autowired ProductRepository productRepository;
    @Autowired InventoryStockRepository stockRepository;
    @Autowired InventoryTransactionRepository transactionRepository;
    @Autowired GoodsIssueRepository goodsIssueRepository;
    @Autowired PurchaseReceiptRepository receiptRepository;
    @Autowired SupplierRepository supplierRepository;
    @Autowired InventoryCountRepository countRepository;
    @Autowired AppUserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired GoodsIssueService goodsIssueService;
    @Autowired PurchaseReceiptService purchaseReceiptService;
    @Autowired InventoryCountService inventoryCountService;

    private Branch branch;
    private Warehouse warehouse;
    private Product product;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        branch = new Branch();
        branch.setCode("IM-" + suffix);
        branch.setName("Mutation " + suffix);
        branch.setAddress("Test");
        branchRepository.saveAndFlush(branch);

        warehouse = new Warehouse();
        warehouse.setWarehouseCode("IM-WH-" + suffix);
        warehouse.setWarehouseName("Mutation Warehouse");
        warehouse.setBranchId(branch.getId());
        warehouse.setType(WarehouseType.MAIN);
        warehouse.setStatus(RecordStatus.ACTIVE);
        warehouseRepository.saveAndFlush(warehouse);

        product = new Product();
        product.setProductCode("IM-P-" + suffix);
        product.setProductName("Mutation Product");
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("Test");
        product.setImportPrice(BigDecimal.TEN);
        product.setSalePrice(BigDecimal.valueOf(20));
        product.setWarrantyMonths(0);
        productRepository.saveAndFlush(product);

        Role adminRole = roleRepository.findByCode("ADMIN")
                .orElseGet(() -> roleRepository.saveAndFlush(new Role("ADMIN", "Admin")));
        AppUser user = new AppUser();
        user.setUsername("mutation-admin-" + suffix);
        user.setEmail("mutation-admin-" + suffix + "@example.test");
        user.setFullName("Mutation Admin");
        user.setPasswordHash("not-used");
        user.setRole(adminRole);
        user.setRoles(Set.of(adminRole));
        userRepository.saveAndFlush(user);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                user.getUsername(), "n/a", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    @Test
    void goodsIssueWritesLedgerEntryOnDecrease() {
        stock(5);
        GoodsIssue issue = new GoodsIssue();
        issue.setIssueNo("GI-" + UUID.randomUUID());
        issue.setBranchId(branch.getId());
        issue.setWarehouse(warehouse);
        issue.setIssueType(GoodsIssueType.OTHER);
        issue.setCreatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        GoodsIssueItem item = new GoodsIssueItem();
        item.setProduct(product);
        item.setQuantity(2);
        item.setUnitCost(BigDecimal.TEN);
        issue.addItem(item);
        issue = goodsIssueRepository.saveAndFlush(issue);

        goodsIssueService.issue(issue.getId());

        assertThat(stockRepository.findByBranchIdAndWarehouseIdAndProductId(branch.getId(), warehouse.getId(), product.getId())
                .orElseThrow().getQuantityOnHand()).isEqualTo(3);
        assertThat(ledgerFor("GOODS_ISSUE", issue.getId())).singleElement()
                .satisfies(tx -> assertThat(tx.getType()).isEqualTo(InventoryTransactionType.GOODS_ISSUE));
    }

    @Test
    void purchaseReceiptConfirmWritesLedgerEntryOnIncrease() {
        Supplier supplier = new Supplier();
        supplier.setCode("IM-SUP-" + UUID.randomUUID().toString().substring(0, 8));
        supplier.setName("Mutation Supplier");
        supplierRepository.saveAndFlush(supplier);
        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setReceiptNo("PR-" + UUID.randomUUID());
        receipt.setSupplier(supplier);
        receipt.setBranchId(branch.getId());
        receipt.setWarehouse(warehouse);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setCreatedBy("mutation-test");
        PurchaseReceiptItem item = new PurchaseReceiptItem();
        item.setProduct(product);
        item.setQuantity(4);
        item.setUnitCost(new BigDecimal("12.50"));
        item.setLineTotal(new BigDecimal("50.00"));
        receipt.addItem(item);
        receipt.setTotalAmount(new BigDecimal("50.00"));
        receipt = receiptRepository.saveAndFlush(receipt);

        purchaseReceiptService.confirm(receipt.getId());

        assertThat(stockRepository.findByBranchIdAndWarehouseIdAndProductId(branch.getId(), warehouse.getId(), product.getId())
                .orElseThrow().getQuantityOnHand()).isEqualTo(4);
        assertThat(ledgerFor("PURCHASE_RECEIPT", receipt.getId())).singleElement()
                .satisfies(tx -> assertThat(tx.getType()).isEqualTo(InventoryTransactionType.PURCHASE_RECEIPT));
    }

    @Test
    void inventoryCountApprovalWritesLedgerEntryPerVarianceLine() {
        stock(8);
        InventoryCount count = new InventoryCount();
        count.setCountNo("IC-" + UUID.randomUUID());
        count.setBranchId(branch.getId());
        count.setWarehouse(warehouse);
        count.setCreatedBy("maker");
        count.setStatus(InventoryCountStatus.PENDING_APPROVAL);
        InventoryCountItem item = new InventoryCountItem();
        item.setProduct(product);
        item.setSystemQuantity(8);
        item.setCountedQuantity(6);
        count.addItem(item);
        count = countRepository.saveAndFlush(count);

        inventoryCountService.approve(count.getId());

        assertThat(stockRepository.findByBranchIdAndWarehouseIdAndProductId(branch.getId(), warehouse.getId(), product.getId())
                .orElseThrow().getQuantityOnHand()).isEqualTo(6);
        assertThat(ledgerFor("INVENTORY_COUNT", count.getId())).singleElement()
                .satisfies(tx -> assertThat(tx.getType()).isEqualTo(InventoryTransactionType.COUNT_ADJUSTMENT_OUT));
    }

    private InventoryStock stock(int quantity) {
        InventoryStock stock = new InventoryStock();
        stock.setBranchId(branch.getId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(quantity);
        return stockRepository.saveAndFlush(stock);
    }

    private List<InventoryTransaction> ledgerFor(String referenceType, Long id) {
        return transactionRepository.findAll().stream()
                .filter(tx -> referenceType.equals(tx.getReferenceType()))
                .filter(tx -> String.valueOf(id).equals(tx.getReferenceId()))
                .toList();
    }
}
