package com.chuanphat.warranty.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class InventoryMutationMigrationPostgresTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("inventory_migration_test")
            .withUsername("chuanphat")
            .withPassword("chuanphat");

    @Test
    void v65FailureRollsBackAndRetryReconcilesLegacyStockAgainstLedger() throws Exception {
        String schema = "inv_v65_" + UUID.randomUUID().toString().replace("-", "");
        try (Connection connection = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE SCHEMA " + schema);
            Flyway throughV64 = flyway(schema, MigrationVersion.fromVersion("64"));
            throughV64.migrate();
            statement.execute("SET search_path TO " + schema);

            long branchId = insertAndReturnId(statement,
                    "INSERT INTO branches(code, name, status) VALUES ('LEGACY-BR', 'Legacy branch', 'ACTIVE') RETURNING id");
            long productId = insertAndReturnId(statement,
                    "INSERT INTO products(product_code, product_name, category, status) "
                            + "VALUES ('LEGACY-P', 'Legacy product', 'SPARE_PART', 'ACTIVE') RETURNING id");
            statement.execute("INSERT INTO inventory_stocks(branch_id, warehouse_id, product_id, quantity_on_hand, average_cost) "
                    + "VALUES (" + branchId + ", NULL, " + productId + ", 7, 125.00)");

            assertThatThrownBy(() -> flyway(schema, MigrationVersion.fromVersion("65")).migrate())
                    .rootCause().hasMessageContaining("Cannot reconcile inventory rows without a MAIN warehouse");
            assertThat(queryLong(statement, "SELECT quantity_on_hand FROM inventory_stocks WHERE product_id = " + productId))
                    .isEqualTo(7);
            assertThat(queryLong(statement, "SELECT COUNT(*) FROM inventory_transactions WHERE product_id = " + productId))
                    .isZero();
            assertThat(queryLong(statement, "SELECT COUNT(*) FROM inventory_stocks WHERE product_id = " + productId
                    + " AND warehouse_id IS NULL")).isEqualTo(1);

            long warehouseId = insertAndReturnId(statement,
                    "INSERT INTO warehouses(warehouse_code, warehouse_name, branch_id, type, status) "
                            + "VALUES ('LEGACY-MAIN', 'Legacy main', " + branchId + ", 'MAIN', 'ACTIVE') RETURNING id");
            flyway(schema, MigrationVersion.fromVersion("65")).migrate();

            assertThat(queryLong(statement, "SELECT quantity_on_hand FROM inventory_stocks WHERE product_id = " + productId
                    + " AND warehouse_id = " + warehouseId)).isEqualTo(7);
            assertThat(queryLong(statement, "SELECT COUNT(*) FROM inventory_transactions WHERE product_id = " + productId
                    + " AND type = 'ADJUSTMENT_IN' AND quantity = 7 AND reference_type = 'LEGACY_BALANCE_RECONCILIATION'"))
                    .isEqualTo(1);
            assertThat(queryLong(statement, "SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'inventory_transactions_append_only'"))
                    .isEqualTo(1);
        } finally {
            try (Connection connection = DriverManager.getConnection(
                    POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                 Statement statement = connection.createStatement()) {
                statement.execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
            }
        }
    }

    private Flyway flyway(String schema, MigrationVersion target) {
        return Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .schemas(schema)
                .defaultSchema(schema)
                .locations("classpath:db/migration")
                .target(target)
                .load();
    }

    private long insertAndReturnId(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getLong(1);
        }
    }

    private long queryLong(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getLong(1);
        }
    }
}
