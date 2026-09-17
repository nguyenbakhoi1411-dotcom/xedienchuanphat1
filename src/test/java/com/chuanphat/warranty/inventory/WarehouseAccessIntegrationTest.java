package com.chuanphat.warranty.inventory;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.RoleRepository;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import com.chuanphat.warranty.core.entity.GoodsIssue;
import com.chuanphat.warranty.core.entity.InventoryCount;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.GoodsIssueType;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.WarehouseAccessLevel;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import com.chuanphat.warranty.core.repository.GoodsIssueRepository;
import com.chuanphat.warranty.core.repository.InventoryCountRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.hr.entity.Employee;
import com.chuanphat.warranty.hr.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:warehouse-rbac;MODE=PostgreSQL;DATABASE_TO_UPPER=false;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.sql.init.mode=never",
        "spring.flyway.enabled=false"
})
class WarehouseAccessIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired BranchRepository branchRepository;
    @Autowired WarehouseRepository warehouseRepository;
    @Autowired ProductRepository productRepository;
    @Autowired InventoryStockRepository stockRepository;
    @Autowired ProductSerialRepository serialRepository;
    @Autowired GoodsIssueRepository goodsIssueRepository;
    @Autowired InventoryCountRepository countRepository;
    @Autowired AppUserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired EmployeeWarehouseRepository accessRepository;

    private String warehouseUsername;
    private String unassignedUsername;
    private String adminUsername;
    private Long branchOneId;
    private Long branchTwoId;
    private Warehouse warehouseA;
    private Warehouse warehouseB;
    private Warehouse warehouseC;
    private Product product;
    private Employee employee;
    private Employee unassignedEmployee;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Branch branchOne = branch("B1-" + suffix);
        Branch branchTwo = branch("B2-" + suffix);
        branchOneId = branchOne.getId();
        branchTwoId = branchTwo.getId();
        warehouseA = warehouse("WA-" + suffix, branchOneId, WarehouseType.MAIN);
        warehouseB = warehouse("WB-" + suffix, branchOneId, WarehouseType.DISPLAY);
        warehouseC = warehouse("WC-" + suffix, branchTwoId, WarehouseType.MAIN);
        product = product("P-" + suffix);
        stock(warehouseA, 10);
        stock(warehouseB, 20);

        Role warehouseRole = role("WAREHOUSE_STAFF");
        warehouseUsername = "warehouse-" + suffix;
        AppUser warehouseUser = appUser(warehouseUsername, warehouseRole, branchOneId, branchTwoId);
        employee = employee("E-" + suffix, warehouseUser, branchOneId);
        assign(employee, warehouseA, WarehouseAccessLevel.OPERATE);

        unassignedUsername = "unassigned-" + suffix;
        AppUser unassignedUser = appUser(unassignedUsername, warehouseRole, branchOneId);
        unassignedEmployee = employee("UNASSIGNED-" + suffix, unassignedUser, branchOneId);

        Role adminRole = role("ADMIN");
        adminUsername = "admin-" + suffix;
        appUser(adminUsername, adminRole);
    }

    @Test
    void cannotViewOtherWarehouseInventoryEvenInSameBranch() throws Exception {
        mockMvc.perform(get("/api/inventory/stocks")
                        .param("branchId", branchOneId.toString())
                        .param("warehouseId", warehouseB.getId().toString())
                        .with(inventoryUser(warehouseUsername, "INVENTORY_VIEW")))
                .andExpect(status().isForbidden());
    }

    @Test
    void cannotOperateStockAtWarehouseWithoutOperateLevelAccess() throws Exception {
        mockMvc.perform(post("/api/inventory/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(importJson(warehouseB.getId()))
                        .with(inventoryUser(warehouseUsername, "INVENTORY_IMPORT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void canViewButCannotOperateWithViewOnlyAccessLevel() throws Exception {
        setAccessLevel(employee, warehouseA, WarehouseAccessLevel.VIEW);

        mockMvc.perform(get("/api/inventory/stocks")
                        .param("branchId", branchOneId.toString())
                        .param("warehouseId", warehouseA.getId().toString())
                        .with(inventoryUser(warehouseUsername, "INVENTORY_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1));

        mockMvc.perform(post("/api/inventory/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(importJson(warehouseA.getId()))
                        .with(inventoryUser(warehouseUsername, "INVENTORY_IMPORT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void canApproveInventoryCountOnlyWithManageLevelAccess() throws Exception {
        InventoryCount count = new InventoryCount();
        count.setCountNo("KKE-" + UUID.randomUUID());
        count.setBranchId(branchOneId);
        count.setWarehouse(warehouseA);
        count.setCreatedBy(warehouseUsername);
        count.setStatus(InventoryCountStatus.PENDING_APPROVAL);
        count = countRepository.saveAndFlush(count);

        mockMvc.perform(post("/api/inventory/counts/{id}/approve", count.getId())
                        .with(inventoryUser(warehouseUsername, "INVENTORY_ADJUST_APPROVE")))
                .andExpect(status().isForbidden());

        setAccessLevel(employee, warehouseA, WarehouseAccessLevel.MANAGE);
        mockMvc.perform(post("/api/inventory/counts/{id}/approve", count.getId())
                        .with(inventoryUser(warehouseUsername, "INVENTORY_ADJUST_APPROVE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void transferRequiresAccessToBothSourceAndDestinationWarehouse() throws Exception {
        String body = """
                {"fromBranchId":%d,"fromWarehouseId":%d,"toBranchId":%d,"toWarehouseId":%d,
                 "productId":%d,"quantity":1,"transactionDate":"2026-09-17","note":"transfer"}
                """.formatted(branchOneId, warehouseA.getId(), branchTwoId, warehouseC.getId(), product.getId());

        mockMvc.perform(post("/api/inventory/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(inventoryUser(warehouseUsername, "INVENTORY_TRANSFER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void serialLookupByIdRespectsWarehouseAccessNotJustBranch() throws Exception {
        ProductSerial serial = new ProductSerial();
        serial.setSerialNumber("SER-" + UUID.randomUUID());
        serial.setProduct(product);
        serial.setBranchId(branchOneId);
        serial.setWarehouse(warehouseB);
        serial.setStatus(SerialStatus.IN_STOCK);
        serial = serialRepository.saveAndFlush(serial);

        mockMvc.perform(get("/api/serials/{id}", serial.getId())
                        .with(inventoryUser(warehouseUsername, "PRODUCT_VIEW")))
                .andExpect(status().isForbidden());
    }

    @Test
    void goodsIssueListOnlyShowsAccessibleWarehouses() throws Exception {
        goodsIssue("GI-A-" + UUID.randomUUID(), warehouseA);
        goodsIssue("GI-B-" + UUID.randomUUID(), warehouseB);

        mockMvc.perform(get("/api/inventory/goods-issues")
                        .param("branchId", branchOneId.toString())
                        .with(inventoryUser(warehouseUsername, "INVENTORY_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].warehouseId").value(warehouseA.getId()));
    }

    @Test
    void adminBypassesWarehouseAccessCheckEntirely() throws Exception {
        mockMvc.perform(get("/api/inventory/stocks")
                        .param("warehouseId", warehouseB.getId().toString())
                        .with(inventoryUser(adminUsername, "INVENTORY_VIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    void employeeWithNoAssignmentHasNoAccessNotFallbackToWholeBranch() throws Exception {
        mockMvc.perform(get("/api/inventory/stocks")
                        .param("branchId", branchOneId.toString())
                        .param("warehouseId", warehouseA.getId().toString())
                        .with(inventoryUser(unassignedUsername, "INVENTORY_VIEW")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanGrantAndRevokeWarehouseAccessThroughApi() throws Exception {
        String body = """
                {"employeeId":%d,"warehouseId":%d,"accessLevel":"VIEW"}
                """.formatted(unassignedEmployee.getId(), warehouseB.getId());

        String response = mockMvc.perform(post("/api/inventory/warehouse-access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(user(adminUsername).roles("ADMIN")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value(unassignedEmployee.getId()))
                .andExpect(jsonPath("$.warehouseId").value(warehouseB.getId()))
                .andExpect(jsonPath("$.accessLevel").value("VIEW"))
                .andReturn().getResponse().getContentAsString();

        Long assignmentId = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/inventory/stocks")
                        .param("warehouseId", warehouseB.getId().toString())
                        .with(inventoryUser(unassignedUsername, "INVENTORY_VIEW")))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/inventory/warehouse-access/{id}", assignmentId)
                        .with(user(adminUsername).roles("ADMIN")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/inventory/stocks")
                        .param("warehouseId", warehouseB.getId().toString())
                        .with(inventoryUser(unassignedUsername, "INVENTORY_VIEW")))
                .andExpect(status().isForbidden());
    }

    @Test
    void warehouseStaffCannotManageWarehouseAssignments() throws Exception {
        String body = """
                {"employeeId":%d,"warehouseId":%d,"accessLevel":"VIEW"}
                """.formatted(unassignedEmployee.getId(), warehouseB.getId());

        mockMvc.perform(post("/api/inventory/warehouse-access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(user(warehouseUsername).roles("WAREHOUSE_STAFF")))
                .andExpect(status().isForbidden());
    }

    private Branch branch(String code) {
        Branch branch = new Branch();
        branch.setCode(code);
        branch.setName(code);
        branch.setAddress("Test address");
        return branchRepository.saveAndFlush(branch);
    }

    private Warehouse warehouse(String code, Long branchId, WarehouseType type) {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseCode(code);
        warehouse.setWarehouseName(code);
        warehouse.setBranchId(branchId);
        warehouse.setType(type);
        warehouse.setStatus(RecordStatus.ACTIVE);
        return warehouseRepository.saveAndFlush(warehouse);
    }

    private Product product(String code) {
        Product product = new Product();
        product.setProductCode(code);
        product.setProductName(code);
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("Test");
        product.setImportPrice(BigDecimal.TEN);
        product.setSalePrice(BigDecimal.valueOf(20));
        product.setWarrantyMonths(0);
        return productRepository.saveAndFlush(product);
    }

    private void stock(Warehouse warehouse, int quantity) {
        InventoryStock stock = new InventoryStock();
        stock.setBranchId(warehouse.getBranchId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(quantity);
        stockRepository.saveAndFlush(stock);
    }

    private Role role(String code) {
        return roleRepository.findByCode(code).orElseGet(() -> roleRepository.saveAndFlush(new Role(code, code)));
    }

    private AppUser appUser(String username, Role role, Long... branchIds) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(username + "@example.test");
        user.setFullName(username);
        user.setPasswordHash("not-used");
        user.setRole(role);
        Set<UserBranchAccess> accesses = new java.util.LinkedHashSet<>();
        for (Long branchId : branchIds) {
            accesses.add(new UserBranchAccess(user, branchId, UserBranchAccess.AccessLevel.MANAGE));
        }
        user.replaceBranchAccesses(accesses);
        return userRepository.saveAndFlush(user);
    }

    private Employee employee(String code, AppUser user, Long branchId) {
        Employee employee = new Employee();
        employee.setEmployeeCode(code);
        employee.setFullName(code);
        employee.setBranchId(branchId);
        employee.setUserId(user.getId());
        return employeeRepository.saveAndFlush(employee);
    }

    private EmployeeWarehouse assign(Employee employee, Warehouse warehouse, WarehouseAccessLevel level) {
        EmployeeWarehouse access = new EmployeeWarehouse();
        access.setEmployeeId(employee.getId());
        access.setWarehouse(warehouse);
        access.setAccessLevel(level);
        access.setActive(true);
        return accessRepository.saveAndFlush(access);
    }

    private void setAccessLevel(Employee employee, Warehouse warehouse, WarehouseAccessLevel level) {
        EmployeeWarehouse access = accessRepository.findByEmployeeIdAndWarehouseId(employee.getId(), warehouse.getId()).orElseThrow();
        access.setAccessLevel(level);
        accessRepository.saveAndFlush(access);
    }

    private void goodsIssue(String number, Warehouse warehouse) {
        GoodsIssue issue = new GoodsIssue();
        issue.setIssueNo(number);
        issue.setBranchId(warehouse.getBranchId());
        issue.setWarehouse(warehouse);
        issue.setIssueType(GoodsIssueType.OTHER);
        issue.setCreatedBy("test");
        goodsIssueRepository.saveAndFlush(issue);
    }

    private String importJson(Long warehouseId) {
        return """
                {"branchId":%d,"warehouseId":%d,"productId":%d,"quantity":1,
                 "unitCost":10,"transactionDate":"2026-09-17","note":"test"}
                """.formatted(branchOneId, warehouseId, product.getId());
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor inventoryUser(String username, String authority) {
        return user(username).authorities(new SimpleGrantedAuthority(authority));
    }
}
