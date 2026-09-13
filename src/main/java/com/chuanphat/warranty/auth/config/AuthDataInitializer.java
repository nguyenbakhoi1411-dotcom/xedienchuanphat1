package com.chuanphat.warranty.auth.config;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Permission;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.PermissionRepository;
import com.chuanphat.warranty.auth.repository.RoleRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {
    private final boolean bootstrapAdminEnabled;
    private final String bootstrapAdminUsername;
    private final String bootstrapAdminPassword;
    private final String bootstrapAdminEmail;
    private final String bootstrapAdminPhone;
    private final String bootstrapAdminFullName;

    public AuthDataInitializer(
            @Value("${app.security.bootstrap-admin.enabled:false}") boolean bootstrapAdminEnabled,
            @Value("${app.security.bootstrap-admin.username:}") String bootstrapAdminUsername,
            @Value("${app.security.bootstrap-admin.password:}") String bootstrapAdminPassword,
            @Value("${app.security.bootstrap-admin.email:}") String bootstrapAdminEmail,
            @Value("${app.security.bootstrap-admin.phone:}") String bootstrapAdminPhone,
            @Value("${app.security.bootstrap-admin.full-name:}") String bootstrapAdminFullName
    ) {
        this.bootstrapAdminEnabled = bootstrapAdminEnabled;
        this.bootstrapAdminUsername = bootstrapAdminUsername;
        this.bootstrapAdminPassword = bootstrapAdminPassword;
        this.bootstrapAdminEmail = bootstrapAdminEmail;
        this.bootstrapAdminPhone = bootstrapAdminPhone;
        this.bootstrapAdminFullName = bootstrapAdminFullName;
    }

    @Bean
    CommandLineRunner initializeAuthData(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            List<String> permissions = List.of(
                    "DASHBOARD_VIEW", "BRANCH_VIEW", "BRANCH_CREATE", "BRANCH_UPDATE", "BRANCH_DELETE",
                    "USER_VIEW", "USER_CREATE", "USER_UPDATE", "ROLE_VIEW", "ROLE_UPDATE",
                    "PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_DELETE", "PRODUCT_EXPORT",
                    "INVENTORY_VIEW", "INVENTORY_IMPORT", "INVENTORY_EXPORT", "INVENTORY_TRANSFER", "INVENTORY_APPROVE", "INVENTORY_TRANSFER_APPROVE", "INVENTORY_STOCKTAKE",
                    "SALES_VIEW", "SALES_CREATE", "SALES_UPDATE", "SALES_CANCEL", "SALES_DISCOUNT_APPROVE", "SALES_RETURN", "INVOICE_ISSUE", "INVOICE_EXPORT",
                    "CUSTOMER_VIEW", "CUSTOMER_CREATE", "CUSTOMER_UPDATE",
                    "SUPPLIER_VIEW", "SUPPLIER_CREATE", "SUPPLIER_UPDATE",
                    "PURCHASE_VIEW", "PURCHASE_CREATE", "PURCHASE_UPDATE", "PURCHASE_APPROVE", "PURCHASE_CANCEL",
                    "WARRANTY_VIEW", "WARRANTY_MANAGE",
                    "ACCOUNTING_VIEW", "ACCOUNTING_CREATE", "ACCOUNTING_POST", "ACCOUNTING_CANCEL", "ACCOUNTING_REPORT", "ACCOUNTING_EXPORT", "RECEIPT_CREATE", "PAYMENT_CREATE",
                    "REPORT_VIEW", "REPORT_EXPORT", "AUDIT_VIEW", "SETTING_MANAGE",
                    "HR_VIEW", "HR_MANAGE", "MARKETING_VIEW", "MARKETING_CREATE", "MARKETING_UPDATE"
                    , "VIEW_PRICE_POLICY", "CREATE_PRICE_POLICY", "EDIT_PRICE_POLICY", "APPROVE_PRICE_POLICY", "CANCEL_PRICE_POLICY",
                    "VIEW_PRICE_HISTORY", "EDIT_BASE_PRICE", "VIEW_COST_PRICE", "VIEW_PROFIT", "APPROVE_SELL_BELOW_COST",
                    "EDIT_COST_PRICE", "APPROVE_DISCOUNT", "CANCEL_INVOICE", "DELETE_DOCUMENT",
                    "LOCK_ACCOUNTING_PERIOD", "UNLOCK_ACCOUNTING_PERIOD", "EXPORT_REPORT", "VIEW_ALL_BRANCHES",
                    "MANAGE_PERMISSIONS", "VIEW_ACCOUNTING", "EDIT_ACCOUNTING", "VIEW_CUSTOMER_DEBT",
                    "EDIT_INVENTORY", "APPROVE_STOCK_ADJUSTMENT", "APPROVE_PURCHASE_ORDER",
                    "APPROVE_STOCK_TRANSFER", "VIEW_AUDIT_LOG", "IMPORT_DATA", "UPLOAD_FILE", "AI_ASSISTANT_USE"
            );
            for (String code : permissions) {
                permissionRepository.findByCode(code).orElseGet(() -> permissionRepository.save(new Permission(code, module(code), action(code))));
            }

            Role adminRole = roleRepository.findByCode("ADMIN").orElseGet(() -> roleRepository.save(new Role("ADMIN", "Quan tri he thong")));
            adminRole.setDescription("Toan quyen he thong");
            adminRole.setSystemRole(true);
            permissionRepository.findAll().forEach(permission -> {
                if (!hasPermission(adminRole, permission.getCode())) {
                    adminRole.getPermissions().add(permission);
                }
            });
            roleRepository.save(adminRole);

            ensureRole(roleRepository, permissionRepository, "SUPER_ADMIN", "Super admin",
                    permissions.toArray(String[]::new));
            ensureRole(roleRepository, permissionRepository, "DIRECTOR", "Giam doc",
                    "DASHBOARD_VIEW", "BRANCH_VIEW", "USER_VIEW", "ROLE_VIEW", "PRODUCT_VIEW", "INVENTORY_VIEW",
                    "SALES_VIEW", "CUSTOMER_VIEW", "WARRANTY_VIEW", "SUPPLIER_VIEW", "ACCOUNTING_VIEW",
                    "ACCOUNTING_REPORT", "ACCOUNTING_EXPORT", "REPORT_VIEW", "REPORT_EXPORT", "EXPORT_REPORT",
                    "AUDIT_VIEW", "VIEW_AUDIT_LOG", "VIEW_ALL_BRANCHES", "VIEW_COST_PRICE", "VIEW_PROFIT",
                    "VIEW_CUSTOMER_DEBT", "VIEW_ACCOUNTING", "APPROVE_DISCOUNT", "APPROVE_PRICE_POLICY",
                    "CANCEL_PRICE_POLICY", "LOCK_ACCOUNTING_PERIOD", "UNLOCK_ACCOUNTING_PERIOD", "IMPORT_DATA", "UPLOAD_FILE", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "BRANCH_MANAGER", "Quan ly chi nhanh",
                    "DASHBOARD_VIEW", "BRANCH_VIEW", "PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_UPDATE",
                    "INVENTORY_VIEW", "INVENTORY_IMPORT", "INVENTORY_EXPORT", "INVENTORY_TRANSFER", "INVENTORY_APPROVE", "INVENTORY_TRANSFER_APPROVE", "INVENTORY_STOCKTAKE",
                    "SALES_VIEW", "SALES_CREATE", "SALES_UPDATE", "SALES_CANCEL", "SALES_DISCOUNT_APPROVE", "SALES_RETURN", "INVOICE_ISSUE", "INVOICE_EXPORT",
                    "CUSTOMER_VIEW", "CUSTOMER_CREATE", "CUSTOMER_UPDATE",
                    "SUPPLIER_VIEW", "SUPPLIER_CREATE", "SUPPLIER_UPDATE",
                    "PURCHASE_VIEW", "PURCHASE_CREATE", "PURCHASE_UPDATE", "PURCHASE_CANCEL",
                    "WARRANTY_VIEW", "WARRANTY_MANAGE", "HR_VIEW", "HR_MANAGE",
                    "VIEW_PRICE_POLICY", "CREATE_PRICE_POLICY", "EDIT_PRICE_POLICY", "APPROVE_PRICE_POLICY", "CANCEL_PRICE_POLICY", "VIEW_PRICE_HISTORY", "VIEW_COST_PRICE", "VIEW_PROFIT",
                    "REPORT_VIEW", "REPORT_EXPORT", "AUDIT_VIEW", "EXPORT_REPORT", "IMPORT_DATA", "UPLOAD_FILE", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "MARKETING_STAFF", "Marketing",
                    "DASHBOARD_VIEW", "CUSTOMER_VIEW", "MARKETING_VIEW", "MARKETING_CREATE", "MARKETING_UPDATE",
                    "VIEW_PRICE_POLICY", "CREATE_PRICE_POLICY", "EDIT_PRICE_POLICY", "VIEW_PRICE_HISTORY", "REPORT_VIEW", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "ACCOUNTANT", "Ke toan",
                    "DASHBOARD_VIEW", "ACCOUNTING_VIEW", "ACCOUNTING_CREATE", "ACCOUNTING_POST", "ACCOUNTING_CANCEL", "ACCOUNTING_REPORT", "ACCOUNTING_EXPORT",
                    "RECEIPT_CREATE", "PAYMENT_CREATE", "REPORT_VIEW", "REPORT_EXPORT", "CUSTOMER_VIEW", "SUPPLIER_VIEW",
                    "VIEW_ACCOUNTING", "EDIT_ACCOUNTING", "VIEW_CUSTOMER_DEBT", "LOCK_ACCOUNTING_PERIOD", "UNLOCK_ACCOUNTING_PERIOD", "EXPORT_REPORT", "IMPORT_DATA", "UPLOAD_FILE", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "TECHNICIAN", "Ky thuat vien",
                    "WARRANTY_VIEW", "WARRANTY_MANAGE", "CUSTOMER_VIEW", "INVOICE_EXPORT", "UPLOAD_FILE", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "SALES_STAFF", "Nhan vien ban hang",
                    "DASHBOARD_VIEW", "PRODUCT_VIEW", "INVENTORY_VIEW", "SALES_VIEW", "SALES_CREATE", "SALES_UPDATE", "SALES_RETURN", "INVOICE_ISSUE", "INVOICE_EXPORT",
                    "CUSTOMER_VIEW", "CUSTOMER_CREATE", "CUSTOMER_UPDATE", "VIEW_PRICE_POLICY", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "WAREHOUSE_STAFF", "Nhan vien kho",
                    "PRODUCT_VIEW", "INVENTORY_VIEW", "INVENTORY_IMPORT", "INVENTORY_EXPORT", "INVENTORY_TRANSFER", "INVENTORY_STOCKTAKE",
                    "SUPPLIER_VIEW", "PURCHASE_VIEW", "PURCHASE_CREATE", "PURCHASE_UPDATE", "PURCHASE_CANCEL",
                    "IMPORT_DATA", "UPLOAD_FILE", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "AUDITOR", "Kiem toan noi bo",
                    "DASHBOARD_VIEW", "REPORT_VIEW", "REPORT_EXPORT", "AUDIT_VIEW", "VIEW_AUDIT_LOG", "EXPORT_REPORT", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "HR_MANAGER", "Quan ly nhan su",
                    "DASHBOARD_VIEW", "HR_VIEW", "HR_MANAGE", "USER_VIEW", "USER_CREATE", "USER_UPDATE", "ROLE_VIEW", "VIEW_AUDIT_LOG", "IMPORT_DATA", "UPLOAD_FILE", "AI_ASSISTANT_USE");
            // Maker-checker approver roles (PR2: purchase-order-maker-checker-approval)
            ensureRole(roleRepository, permissionRepository, "PURCHASE_MANAGER", "Quan ly mua hang",
                    "DASHBOARD_VIEW", "PURCHASE_VIEW", "PURCHASE_APPROVE", "SUPPLIER_VIEW", "REPORT_VIEW", "AI_ASSISTANT_USE");
            ensureRole(roleRepository, permissionRepository, "CHIEF_ACCOUNTANT", "Ke toan truong",
                    "DASHBOARD_VIEW", "PURCHASE_VIEW", "PURCHASE_APPROVE", "ACCOUNTING_VIEW", "ACCOUNTING_REPORT",
                    "RECEIPT_CREATE", "PAYMENT_CREATE", "SUPPLIER_VIEW", "REPORT_VIEW", "REPORT_EXPORT",
                    "VIEW_ACCOUNTING", "VIEW_CUSTOMER_DEBT", "LOCK_ACCOUNTING_PERIOD", "AI_ASSISTANT_USE");

            if (bootstrapAdminEnabled) {
                validateBootstrapAdmin();
                AppUser admin = userRepository.findByUsernameIgnoreCase(bootstrapAdminUsername).orElseGet(AppUser::new);
                admin.setUsername(bootstrapAdminUsername);
                admin.setEmail(bootstrapAdminEmail);
                admin.setPhone(bootstrapAdminPhone.isBlank() ? null : bootstrapAdminPhone);
                admin.setFullName(bootstrapAdminFullName);
                admin.setPasswordHash(passwordEncoder.encode(bootstrapAdminPassword));
                admin.setRole(adminRole);
                admin.setRoles(new java.util.LinkedHashSet<>(List.of(adminRole)));
                admin.setStatus(AppUser.Status.ACTIVE);
                userRepository.save(admin);
            }
        };
    }

    private void ensureRole(RoleRepository roleRepository, PermissionRepository permissionRepository, String code, String name, String... permissions) {
        Role role = roleRepository.findByCode(code).orElseGet(() -> roleRepository.save(new Role(code, name)));
        role.setName(name);
        role.setDescription(description(code));
        role.setSystemRole(true);
        for (String permissionCode : permissions) {
            permissionRepository.findByCode(permissionCode).ifPresent(permission -> {
                if (!hasPermission(role, permissionCode)) {
                    role.getPermissions().add(permission);
                }
            });
        }
        roleRepository.save(role);
    }

    private boolean hasPermission(Role role, String permissionCode) {
        return role.getPermissions().stream().anyMatch(permission -> permission.getCode().equals(permissionCode));
    }

    private String module(String code) {
        if (code.startsWith("INVENTORY_")) {
            return "INVENTORY";
        }
        if (code.startsWith("SALES_")) {
            return "SALES";
        }
        if (code.startsWith("ACCOUNTING_")) {
            return "ACCOUNTING";
        }
        return code.split("_")[0];
    }

    private String action(String code) {
        String module = module(code);
        return code.substring(module.length() + 1).toUpperCase(Locale.ROOT);
    }

    private String description(String code) {
        return switch (code) {
            case "BRANCH_MANAGER" -> "Quan ly van hanh chi nhanh";
            case "SUPER_ADMIN" -> "Toan quyen he thong";
            case "DIRECTOR" -> "Xem va phe duyet toan he thong";
            case "MARKETING_STAFF" -> "Marketing va cham soc khach hang";
            case "ACCOUNTANT" -> "Thu chi, cong no va bao cao tai chinh";
            case "TECHNICIAN" -> "Bao hanh va sua chua";
            case "SALES_STAFF" -> "Ban hang va cham soc khach hang";
            case "WAREHOUSE_STAFF" -> "Nhap xuat ton va kiem kho";
            case "AUDITOR" -> "Xem bao cao va nhat ky he thong";
            case "HR_MANAGER" -> "Quan ly nhan su, tai khoan va ho so";
            case "PURCHASE_MANAGER" -> "Duyet don mua hang duoi 20 trieu";
            case "CHIEF_ACCOUNTANT" -> "Duyet don mua hang tu 20 den 100 trieu";
            default -> "Vai tro he thong";
        };
    }

    private void validateBootstrapAdmin() {
        if (bootstrapAdminUsername.isBlank()
                || bootstrapAdminPassword.isBlank()
                || bootstrapAdminEmail.isBlank()
                || bootstrapAdminFullName.isBlank()) {
            throw new IllegalStateException("Bootstrap admin requires username, password, email, and full name");
        }
        if (bootstrapAdminPassword.length() < 8) {
            throw new IllegalStateException("Bootstrap admin password must have at least 8 characters");
        }
    }
}
