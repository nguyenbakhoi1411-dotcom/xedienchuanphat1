package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.hr.repository.EmployeeRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ReportAccessService {
    private final BranchSecurity branchSecurity;
    private final EmployeeRepository employeeRepository;
    private final EmployeeWarehouseRepository employeeWarehouseRepository;
    private final WarehouseRepository warehouseRepository;

    public ReportAccessService(
            BranchSecurity branchSecurity,
            EmployeeRepository employeeRepository,
            EmployeeWarehouseRepository employeeWarehouseRepository,
            WarehouseRepository warehouseRepository
    ) {
        this.branchSecurity = branchSecurity;
        this.employeeRepository = employeeRepository;
        this.employeeWarehouseRepository = employeeWarehouseRepository;
        this.warehouseRepository = warehouseRepository;
    }

    public boolean canViewAllReports() {
        AppUser user = branchSecurity.currentUser();
        return branchSecurity.isAdmin(user) || hasRole(user, "CHIEF_ACCOUNTANT") || hasPermission(user, "REPORT_VIEW_ALL");
    }

    public Optional<Long> currentEmployeeId() {
        AppUser user = branchSecurity.currentUser();
        return employeeRepository.findByUserId(user.getId())
                .map(com.chuanphat.warranty.hr.entity.Employee::getId)
                .or(() -> Optional.ofNullable(user.getId()));
    }

    public Set<Long> accessibleWarehouseIds() {
        if (canViewAllReports()) {
            return Set.of();
        }
        Set<Long> employeeWarehouseIds = currentEmployeeId()
                .map(employeeWarehouseRepository::findByEmployeeIdAndActiveTrue)
                .orElseGet(List::of)
                .stream()
                .map(EmployeeWarehouse::getWarehouse)
                .map(Warehouse::getId)
                .collect(Collectors.toSet());
        if (!employeeWarehouseIds.isEmpty()) {
            return employeeWarehouseIds;
        }
        AppUser user = branchSecurity.currentUser();
        Set<Long> branchIds = user.getBranchAccesses().stream()
                .map(UserBranchAccess::getBranchId)
                .collect(Collectors.toSet());
        if (branchIds.isEmpty()) {
            return Set.of();
        }
        return warehouseRepository.findByBranchIdIn(branchIds).stream()
                .map(Warehouse::getId)
                .collect(Collectors.toSet());
    }

    private static boolean hasRole(AppUser user, String roleCode) {
        return user.getRoles().stream().anyMatch(role -> roleCode.equals(role.getCode()));
    }

    private static boolean hasPermission(AppUser user, String permissionCode) {
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission -> permissionCode.equals(permission.getCode()));
    }
}
