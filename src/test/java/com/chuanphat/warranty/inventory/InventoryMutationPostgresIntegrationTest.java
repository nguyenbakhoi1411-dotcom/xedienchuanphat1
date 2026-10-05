package com.chuanphat.warranty.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.RoleRepository;
import com.chuanphat.warranty.core.dto.InventoryMutationRequest;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.InventoryMutationType;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.InventoryMutationService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@ActiveProfiles("test")
class InventoryMutationPostgresIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("inventory_mutation_test")
            .withUsername("chuanphat")
            .withPassword("chuanphat");

    @DynamicPropertySource
    static void configurePostgres(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", POSTGRES::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.sql.init.mode", () -> "never");
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
    }

    @Autowired BranchRepository branchRepository;
    @Autowired WarehouseRepository warehouseRepository;
    @Autowired ProductRepository productRepository;
    @Autowired InventoryStockRepository stockRepository;
    @Autowired InventoryAverageCostRepository averageCostRepository;
    @Autowired InventoryTransactionRepository transactionRepository;
    @Autowired AppUserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired InventoryMutationService mutationService;
    @Autowired JdbcTemplate jdbcTemplate;

    private Fixture fixture;

    @BeforeEach
    void setUp() {
        fixture = createFixture(10);
        authenticate(fixture.username());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void everyInventoryStockChangeWritesExactlyOneLedgerRow() {
        long before = transactionRepository.count();
        mutationService.apply(mutation(4, InventoryMutationType.PURCHASE_RECEIPT, "RECEIPT", "r-1"));
        assertThat(transactionRepository.count()).isEqualTo(before + 1);
        mutationService.apply(mutation(-3, InventoryMutationType.SALES_ISSUE, "ORDER", "o-1"));

        InventoryStock stock = stockRepository.findByBranchIdAndWarehouseIdAndProductId(
                fixture.branch().getId(), fixture.warehouse().getId(), fixture.product().getId()).orElseThrow();
        assertThat(stock.getQuantityOnHand()).isEqualTo(11);
        assertThat(transactionRepository.count()).isEqualTo(before + 2);
    }

    @Test
    void mutationResultingInNegativeStockIsRejectedByDefault() {
        long transactionsBefore = transactionRepository.count();
        assertThatThrownBy(() -> mutationService.apply(
                mutation(-11, InventoryMutationType.SALES_ISSUE, "ORDER", "too-large")))
                .hasMessageContaining("negative");

        assertThat(stockRepository.findByBranchIdAndWarehouseIdAndProductId(
                fixture.branch().getId(), fixture.warehouse().getId(), fixture.product().getId())
                .orElseThrow().getQuantityOnHand()).isEqualTo(10);
        assertThat(transactionRepository.count()).isEqualTo(transactionsBefore);
    }

    @Test
    void concurrentMutationsOnSameStockRowAreSerializedNotLost() throws Exception {
        long before = transactionRepository.count();
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<?> first = executor.submit(() -> mutateAfter(start, 4, "worker-a"));
            Future<?> second = executor.submit(() -> mutateAfter(start, 7, "worker-b"));
            start.countDown();
            first.get();
            second.get();
        } finally {
            executor.shutdownNow();
        }

        InventoryStock stock = stockRepository.findByBranchIdAndWarehouseIdAndProductId(
                fixture.branch().getId(), fixture.warehouse().getId(), fixture.product().getId()).orElseThrow();
        assertThat(stock.getQuantityOnHand()).isEqualTo(21);
        assertThat(transactionRepository.count()).isEqualTo(before + 2);
    }

    @Test
    void ledgerRowAlwaysReferencesSourceDocumentTypeAndId() {
        InventoryTransaction transaction = mutationService.apply(
                mutation(2, InventoryMutationType.MANUAL_CORRECTION, "COUNT_SHEET", "CS-42"));

        InventoryTransaction persisted = transactionRepository.findById(transaction.getId()).orElseThrow();
        assertThat(persisted.getReferenceType()).isEqualTo("COUNT_SHEET");
        assertThat(persisted.getReferenceId()).isEqualTo("CS-42");
        assertThat(persisted.getCreatedBy()).isEqualTo(fixture.username());
    }

    @Test
    void inventoryTransactionRowsRejectUpdatesAndDeletes() {
        InventoryTransaction transaction = mutationService.apply(
                mutation(1, InventoryMutationType.MANUAL_CORRECTION, "MANUAL", "immutable"));

        assertThatThrownBy(() -> jdbcTemplate.update(
                "update inventory_transactions set note = 'changed' where id = ?", transaction.getId()))
                .hasMessageContaining("append-only");
        assertThatThrownBy(() -> jdbcTemplate.update(
                "delete from inventory_transactions where id = ?", transaction.getId()))
                .hasMessageContaining("append-only");
    }

    @Test
    void ledgerInsertFailureRollsBackStockMutationOnPostgres() {
        long transactionsBefore = transactionRepository.count();
        jdbcTemplate.execute("""
                CREATE OR REPLACE FUNCTION reject_inventory_ledger_insert_for_test()
                RETURNS trigger AS $$
                BEGIN
                    RAISE EXCEPTION 'forced ledger insert failure';
                END;
                $$ LANGUAGE plpgsql
                """);
        jdbcTemplate.execute("""
                CREATE TRIGGER reject_inventory_ledger_insert_for_test
                BEFORE INSERT ON inventory_transactions
                FOR EACH ROW EXECUTE FUNCTION reject_inventory_ledger_insert_for_test()
                """);
        try {
            assertThatThrownBy(() -> mutationService.apply(
                    mutation(3, InventoryMutationType.MANUAL_CORRECTION, "ROLLBACK_TEST", "ledger-failure")))
                    .rootCause().hasMessageContaining("forced ledger insert failure");

            InventoryStock stock = stockRepository.findByBranchIdAndWarehouseIdAndProductId(
                    fixture.branch().getId(), fixture.warehouse().getId(), fixture.product().getId()).orElseThrow();
            assertThat(stock.getQuantityOnHand()).isEqualTo(10);
            assertThat(transactionRepository.count()).isEqualTo(transactionsBefore);
        } finally {
            jdbcTemplate.execute("DROP TRIGGER IF EXISTS reject_inventory_ledger_insert_for_test ON inventory_transactions");
            jdbcTemplate.execute("DROP FUNCTION IF EXISTS reject_inventory_ledger_insert_for_test()");
        }
    }

    private void mutateAfter(CountDownLatch start, int delta, String ref) {
        authenticate(fixture.username());
        try {
            start.await();
            mutationService.apply(mutation(delta, InventoryMutationType.MANUAL_CORRECTION, "CONCURRENT_TEST", ref));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(exception);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private InventoryMutationRequest mutation(int delta, InventoryMutationType type, String refType, String refId) {
        return new InventoryMutationRequest(fixture.warehouse().getId(), fixture.product().getId(), delta,
                type, "integration test", refType, refId, refId, fixture.username(), LocalDate.now(), BigDecimal.TEN);
    }

    private Fixture createFixture(int quantity) {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Branch branch = new Branch();
        branch.setCode("INV-" + suffix);
        branch.setName("Inventory test " + suffix);
        branch.setAddress("Test");
        branchRepository.saveAndFlush(branch);

        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseCode("INV-WH-" + suffix);
        warehouse.setWarehouseName("Inventory test warehouse");
        warehouse.setBranchId(branch.getId());
        warehouse.setType(WarehouseType.MAIN);
        warehouse.setStatus(RecordStatus.ACTIVE);
        warehouseRepository.saveAndFlush(warehouse);

        Product product = new Product();
        product.setProductCode("INV-P-" + suffix);
        product.setProductName("Inventory test product");
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("Test");
        product.setImportPrice(BigDecimal.TEN);
        product.setSalePrice(BigDecimal.valueOf(20));
        product.setWarrantyMonths(0);
        productRepository.saveAndFlush(product);

        InventoryStock stock = new InventoryStock();
        stock.setBranchId(branch.getId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(quantity);
        stockRepository.saveAndFlush(stock);
        InventoryAverageCost averageCost = new InventoryAverageCost();
        averageCost.setBranchId(branch.getId());
        averageCost.setWarehouse(warehouse);
        averageCost.setProduct(product);
        averageCost.setQuantity(quantity);
        averageCost.setAverageCost(BigDecimal.TEN);
        averageCostRepository.saveAndFlush(averageCost);

        Role adminRole = roleRepository.findByCode("ADMIN")
                .orElseGet(() -> roleRepository.saveAndFlush(new Role("ADMIN", "Admin")));
        String username = "inv-admin-" + suffix;
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(username + "@example.test");
        user.setFullName("Inventory Test Admin");
        user.setPasswordHash("not-used");
        user.setRole(adminRole);
        user.setRoles(Set.of(adminRole));
        userRepository.saveAndFlush(user);
        return new Fixture(branch, warehouse, product, username);
    }

    private void authenticate(String username) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                username, "n/a", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private record Fixture(Branch branch, Warehouse warehouse, Product product, String username) {}
}
