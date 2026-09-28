package com.chuanphat.warranty.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.PostgresIntegrationTest;
import com.chuanphat.warranty.accounting.entity.AccountingPeriod;
import com.chuanphat.warranty.accounting.enums.AccountingPeriodStatus;
import com.chuanphat.warranty.accounting.repository.AccountingPeriodRepository;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.RoleRepository;
import com.chuanphat.warranty.audit.entity.AuditLog;
import com.chuanphat.warranty.audit.repository.AuditLogRepository;
import com.chuanphat.warranty.core.dto.CreateSalesOrderItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderRequest;
import com.chuanphat.warranty.core.dto.InventoryTransferRequest;
import com.chuanphat.warranty.core.dto.InventoryTransferResponse;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.WarehouseAccessLevel;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.InventoryTransferRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.InventoryTransferService;
import com.chuanphat.warranty.core.service.SalesService;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.hr.entity.Employee;
import com.chuanphat.warranty.hr.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryTransferIntegrationTest extends PostgresIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired InventoryTransferService transferService;
    @Autowired InventoryTransferRepository transferRepository;
    @Autowired InventoryStockRepository stockRepository;
    @Autowired InventoryTransactionRepository transactionRepository;
    @Autowired WarehouseRepository warehouseRepository;
    @Autowired ProductRepository productRepository;
    @Autowired ProductSerialRepository serialRepository;
    @Autowired BranchRepository branchRepository;
    @Autowired AppUserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired EmployeeWarehouseRepository accessRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired SalesService salesService;
    @Autowired AccountingPeriodRepository periodRepository;
    @Autowired AuditLogRepository auditLogRepository;
    @Autowired JdbcTemplate jdbcTemplate;

    private String suffix;
    private String makerName;
    private String managerName;
    private Long branchId;
    private Long makerEmployeeId;
    private Warehouse from;
    private Warehouse to;
    private Product product;

    @BeforeEach
    void setUp() {
        suffix = UUID.randomUUID().toString().substring(0, 8);
        makerName = "maker-" + suffix;
        managerName = "manager-" + suffix;
        Branch branch = new Branch();
        branch.setCode("BT-" + suffix);
        branch.setName("Transfer test " + suffix);
        branch.setAddress("Integration test");
        branchId = branchRepository.saveAndFlush(branch).getId();
        from = warehouse("FROM-" + suffix, branchId);
        to = warehouse("TO-" + suffix, branchId);
        product = product("PART-" + suffix, ProductCategory.SPARE_PART);
        stock(from, 20);
        stock(to, 3);

        Role staffRole = role("WAREHOUSE_STAFF");
        AppUser maker = appUser(makerName, staffRole, branchId);
        AppUser manager = appUser(managerName, staffRole, branchId);
        Employee makerEmployee = employee(makerName, maker, branchId);
        Employee managerEmployee = employee(managerName, manager, branchId);
        makerEmployeeId = makerEmployee.getId();
        assign(makerEmployee, from, WarehouseAccessLevel.OPERATE);
        assign(makerEmployee, to, WarehouseAccessLevel.OPERATE);
        assign(managerEmployee, from, WarehouseAccessLevel.MANAGE);
        assign(managerEmployee, to, WarehouseAccessLevel.MANAGE);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createTransferDoesNotChangeStock() {
        as(makerName, "INVENTORY_TRANSFER");
        transferService.create(request(4, null));
        assertStock(20, 3);
    }

    @Test
    void submitTransferDoesNotChangeStock() {
        as(makerName, "INVENTORY_TRANSFER");
        InventoryTransferResponse draft = transferService.create(request(4, null));
        transferService.submit(draft.id());
        assertStock(20, 3);
    }

    @Test
    void transferCreatorCannotApproveOwnTransfer() {
        as(makerName, "INVENTORY_TRANSFER");
        InventoryTransferResponse submitted = transferService.createAndSubmit(request(4, null));
        as(makerName, "INVENTORY_TRANSFER_APPROVE");
        assertThatThrownBy(() -> transferService.approve(submitted.id())).isInstanceOf(AccessDeniedException.class);
        assertStock(20, 3);
    }

    @Test
    void approverNeedsManageAccessOnBothWarehouses() {
        as(makerName, "INVENTORY_TRANSFER");
        InventoryTransferResponse submitted = transferService.createAndSubmit(request(4, null));
        Long managerEmployeeId = employeeRepository.findByUserId(userRepository.findByUsernameIgnoreCase(managerName).orElseThrow().getId()).orElseThrow().getId();
        accessRepository.delete(accessRepository.findByEmployeeIdAndWarehouseId(managerEmployeeId, to.getId()).orElseThrow());
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        assertThatThrownBy(() -> transferService.approve(submitted.id())).isInstanceOf(AccessDeniedException.class);
        assertStock(20, 3);
    }

    @Test
    void approveMovesStockOutAndInAtomically() {
        InventoryTransferResponse submitted = submitted(7, null);
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        InventoryTransferResponse approved = transferService.approve(submitted.id());
        assertThat(approved.status().name()).isEqualTo("APPROVED");
        assertStock(13, 10);
        List<InventoryTransaction> rows = transferTransactions();
        assertThat(rows).hasSize(2).allMatch(row -> managerName.equals(row.getCreatedBy()));
    }

    @Test
    void failureDuringInboundLegRollsBackOutboundLeg() {
        InventoryTransferResponse submitted = submitted(10, null);
        jdbcTemplate.execute("ALTER TABLE inventory_stocks ADD CONSTRAINT ck_transfer_in_" + suffix
                + " CHECK (warehouse_id <> " + to.getId() + " OR quantity_on_hand <= 5)");
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        assertThatThrownBy(() -> transferService.approve(submitted.id())).isInstanceOf(RuntimeException.class);
        assertStock(20, 3);
        assertThat(transferTransactions()).isEmpty();
    }

    @Test
    void approveTwiceDoesNotMoveStockTwice() {
        InventoryTransferResponse submitted = submitted(6, null);
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        transferService.approve(submitted.id());
        transferService.approve(submitted.id());
        assertStock(14, 9);
        assertThat(transferTransactions()).hasSize(2);
    }

    @Test
    void concurrentApprovalsMoveStockOnlyOnce() throws Exception {
        InventoryTransferResponse submitted = submitted(5, null);
        var pool = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try {
            var first = pool.submit(() -> approveInParallel(submitted.id(), ready, start));
            var second = pool.submit(() -> approveInParallel(submitted.id(), ready, start));
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(first.get(30, TimeUnit.SECONDS)).isEqualTo("APPROVED");
            assertThat(second.get(30, TimeUnit.SECONDS)).isEqualTo("APPROVED");
        } finally {
            pool.shutdownNow();
        }
        assertStock(15, 8);
        assertThat(transferTransactions()).hasSize(2);
    }

    @Test
    void approveRevalidatesSourceStockAtApprovalTime() {
        InventoryTransferResponse submitted = submitted(12, null);
        InventoryStock source = stockRepository.findByBranchIdAndWarehouseIdAndProductId(branchId, from.getId(), product.getId()).orElseThrow();
        source.setQuantityOnHand(5);
        stockRepository.saveAndFlush(source);
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        assertThatThrownBy(() -> transferService.approve(submitted.id())).isInstanceOf(BusinessException.class);
        assertStock(5, 3);
    }

    @Test
    void approveBlockedInLockedAccountingPeriod() {
        InventoryTransferResponse submitted = submitted(2, null);
        AccountingPeriod period = new AccountingPeriod();
        period.setPeriodCode("LOCK-" + suffix);
        period.setYear(2026);
        period.setMonth(9);
        period.setStartDate(LocalDate.of(2026, 9, 1));
        period.setEndDate(LocalDate.of(2026, 9, 30));
        period.setStatus(AccountingPeriodStatus.LOCKED);
        period.setBranchId(branchId);
        period.setCreatedBy(managerName);
        periodRepository.saveAndFlush(period);
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        assertThatThrownBy(() -> transferService.approve(submitted.id())).isInstanceOf(IllegalStateException.class);
        assertStock(20, 3);
    }

    @Test
    void rejectedOrCancelledTransferNeverMovesStock() {
        as(makerName, "INVENTORY_TRANSFER");
        InventoryTransferResponse rejectTarget = transferService.createAndSubmit(request(2, null));
        InventoryTransferResponse cancelTarget = transferService.createAndSubmit(request(3, null));
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        transferService.reject(rejectTarget.id(), "Không đủ kế hoạch điều chuyển");
        as(makerName, "INVENTORY_TRANSFER");
        transferService.cancel(cancelTarget.id());
        assertStock(20, 3);
        assertThat(transferTransactions()).isEmpty();
    }

    @Test
    void serialInPendingTransferCannotBeSoldOrTransferredElsewhere() {
        Product vehicle = product("BIKE-" + suffix, ProductCategory.ELECTRIC_MOTORBIKE);
        stock(from, 1, vehicle);
        ProductSerial serial = new ProductSerial();
        serial.setSerialNumber("SER-" + suffix);
        serial.setProduct(vehicle);
        serial.setBranchId(branchId);
        serial.setWarehouse(from);
        serial.setStatus(SerialStatus.IN_STOCK);
        serial = serialRepository.saveAndFlush(serial);
        Long serialId = serial.getId();
        as(makerName, "INVENTORY_TRANSFER");
        InventoryTransferResponse pending = transferService.createAndSubmit(request(1, serialId, vehicle));
        assertThat(serialRepository.findById(serialId).orElseThrow().getStatus()).isEqualTo(SerialStatus.TRANSFERING);

        Customer customer = new Customer();
        customer.setPhone("09" + suffix + "0000");
        customer.setFullName("Transfer test customer");
        customer.setBranchId(branchId);
        customer = customerRepository.saveAndFlush(customer);
        Long customerId = customer.getId();
        as(makerName, "SALES_CREATE");
        CreateSalesOrderRequest order = new CreateSalesOrderRequest(branchId, customerId, makerEmployeeId,
                LocalDate.now(), null, null, null, null, null, "test pending transfer", false, null,
                false, List.of(), List.of(new CreateSalesOrderItemRequest(vehicle.getId(), serialId, 1, null)));
        assertThatThrownBy(() -> salesService.create(order)).isInstanceOf(BusinessException.class)
                .hasMessageContaining("Serial is not available for sale");
        assertThatThrownBy(() -> transferService.transferSerial(serialId, branchId, to.getId(), "another move"))
                .isInstanceOf(BusinessException.class);
        assertThat(transferRepository.findById(pending.id()).orElseThrow().getStatus().name()).isEqualTo("PENDING_APPROVAL");
    }

    @Test
    void legacyImmediateTransferPathNoLongerMovesStockWithoutApproval() throws Exception {
        String body = """
                {"fromBranchId":%d,"fromWarehouseId":%d,"toBranchId":%d,"toWarehouseId":%d,
                 "productId":%d,"quantity":4,"transactionDate":"2026-09-17","note":"legacy"}
                """.formatted(branchId, from.getId(), branchId, to.getId(), product.getId());
        var result = mockMvc.perform(post("/api/inventory/transfer")
                        .contentType(MediaType.APPLICATION_JSON).content(body)
                        .with(user(makerName).authorities(new SimpleGrantedAuthority("INVENTORY_TRANSFER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andReturn();
        assertThat(result.getResponse().getContentAsString()).contains("transferNo");
        assertStock(20, 3);
    }

    @Test
    void auditLogRecordedForEachTransition() {
        InventoryTransferResponse approval = submitted(1, null);
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        transferService.approve(approval.id());

        InventoryTransferResponse rejection = submitted(1, null);
        as(managerName, "INVENTORY_TRANSFER_APPROVE");
        transferService.reject(rejection.id(), "integration rejection");

        as(makerName, "INVENTORY_TRANSFER");
        InventoryTransferResponse cancellation = transferService.create(request(1, null));
        transferService.cancel(cancellation.id());

        List<AuditLog> rows = auditLogRepository.findAll().stream()
                .filter(log -> "InventoryTransfer".equals(log.getEntityType()))
                .toList();
        assertThat(rows.stream().filter(log -> approval.id().toString().equals(log.getEntityId())).count()).isEqualTo(3);
        assertThat(rows.stream().filter(log -> rejection.id().toString().equals(log.getEntityId())).count()).isEqualTo(3);
        assertThat(rows.stream().filter(log -> cancellation.id().toString().equals(log.getEntityId())).count()).isEqualTo(2);
        assertThat(rows).allMatch(log -> !"system".equals(log.getUserId()));
    }

    private String approveInParallel(Long id, CountDownLatch ready, CountDownLatch start) throws Exception {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                managerName, "n/a", List.of(new SimpleGrantedAuthority("INVENTORY_TRANSFER_APPROVE"))));
        ready.countDown();
        if (!start.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("approval start timed out");
        return transferService.approve(id).status().name();
    }

    private InventoryTransferResponse submitted(int quantity, Long serialId) {
        as(makerName, "INVENTORY_TRANSFER");
        return transferService.createAndSubmit(request(quantity, serialId));
    }

    private InventoryTransferRequest request(int quantity, Long serialId) {
        return request(quantity, serialId, product);
    }

    private InventoryTransferRequest request(int quantity, Long serialId, Product selectedProduct) {
        return new InventoryTransferRequest(branchId, from.getId(), branchId, to.getId(),
                selectedProduct.getId(), quantity, LocalDate.of(2026, 9, 17), "integration transfer", serialId);
    }

    private void assertStock(int sourceQuantity, int destinationQuantity) {
        assertThat(stockRepository.findByBranchIdAndWarehouseIdAndProductId(branchId, from.getId(), product.getId())
                .orElseThrow().getQuantityOnHand()).isEqualTo(sourceQuantity);
        assertThat(stockRepository.findByBranchIdAndWarehouseIdAndProductId(branchId, to.getId(), product.getId())
                .orElseThrow().getQuantityOnHand()).isEqualTo(destinationQuantity);
    }

    private List<InventoryTransaction> transferTransactions() {
        return transactionRepository.findAll().stream()
                .filter(row -> row.getProduct().getId().equals(product.getId()))
                .filter(row -> row.getType() == InventoryTransactionType.TRANSFER_IN
                        || row.getType() == InventoryTransactionType.TRANSFER_OUT)
                .toList();
    }

    private void as(String username, String... authorities) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                username, "n/a", java.util.Arrays.stream(authorities).map(SimpleGrantedAuthority::new).toList()));
    }

    private Warehouse warehouse(String code, Long branch) {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseCode(code);
        warehouse.setWarehouseName(code);
        warehouse.setBranchId(branch);
        warehouse.setType(WarehouseType.MAIN);
        warehouse.setStatus(RecordStatus.ACTIVE);
        return warehouseRepository.saveAndFlush(warehouse);
    }

    private Product product(String code, ProductCategory category) {
        Product selected = new Product();
        selected.setProductCode(code);
        selected.setProductName(code);
        selected.setCategory(category);
        selected.setBrand("Integration");
        selected.setImportPrice(BigDecimal.TEN);
        selected.setSalePrice(BigDecimal.valueOf(100));
        selected.setWarrantyMonths(12);
        return productRepository.saveAndFlush(selected);
    }

    private void stock(Warehouse warehouse, int quantity) {
        stock(warehouse, quantity, product);
    }

    private void stock(Warehouse warehouse, int quantity, Product selectedProduct) {
        InventoryStock row = new InventoryStock();
        row.setBranchId(warehouse.getBranchId());
        row.setWarehouse(warehouse);
        row.setProduct(selectedProduct);
        row.setQuantityOnHand(quantity);
        stockRepository.saveAndFlush(row);
    }

    private Role role(String code) {
        return roleRepository.findByCode(code).orElseGet(() -> roleRepository.saveAndFlush(new Role(code, code)));
    }

    private AppUser appUser(String username, Role role, Long branch) {
        AppUser account = new AppUser();
        account.setUsername(username);
        account.setEmail(username + "@example.test");
        account.setFullName(username);
        account.setPasswordHash("not-used");
        account.setRole(role);
        UserBranchAccess branchAccess = new UserBranchAccess(account, branch, UserBranchAccess.AccessLevel.MANAGE);
        account.replaceBranchAccesses(Set.of(branchAccess));
        return userRepository.saveAndFlush(account);
    }

    private Employee employee(String code, AppUser account, Long branch) {
        Employee employee = new Employee();
        employee.setEmployeeCode("E-" + code);
        employee.setFullName(code);
        employee.setBranchId(branch);
        employee.setUserId(account.getId());
        return employeeRepository.saveAndFlush(employee);
    }

    private void assign(Employee employee, Warehouse warehouse, WarehouseAccessLevel level) {
        EmployeeWarehouse access = new EmployeeWarehouse();
        access.setEmployeeId(employee.getId());
        access.setWarehouse(warehouse);
        access.setAccessLevel(level);
        access.setActive(true);
        accessRepository.saveAndFlush(access);
    }
}
