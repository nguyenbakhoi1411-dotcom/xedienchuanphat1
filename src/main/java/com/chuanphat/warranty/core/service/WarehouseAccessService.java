package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import com.chuanphat.warranty.core.enums.WarehouseAccessLevel;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.hr.repository.EmployeeRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WarehouseAccessService {
    private final BranchSecurity branchSecurity;
    private final EmployeeRepository employeeRepository;
    private final EmployeeWarehouseRepository employeeWarehouseRepository;
    private final WarehouseRepository warehouseRepository;

    public WarehouseAccessService(
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

    @Transactional(readOnly = true)
    public boolean hasAccess(Long employeeId, Long warehouseId, WarehouseAccessLevel requiredLevel) {
        if (isPrivileged()) {
            return warehouseRepository.existsById(warehouseId);
        }
        if (employeeId == null || warehouseId == null || requiredLevel == null) {
            return false;
        }
        return employeeWarehouseRepository.findByEmployeeIdAndWarehouseIdAndActiveTrue(employeeId, warehouseId)
                .map(EmployeeWarehouse::getAccessLevel)
                .filter(level -> level.allows(requiredLevel))
                .isPresent();
    }

    @Transactional(readOnly = true)
    public List<Long> getAccessibleWarehouseIds(Long employeeId, Long branchId) {
        if (isPrivileged()) {
            if (branchId == null) {
                return warehouseRepository.findAll().stream().map(warehouse -> warehouse.getId()).toList();
            }
            return warehouseRepository.findByBranchIdOrderByWarehouseName(branchId).stream()
                    .map(warehouse -> warehouse.getId())
                    .toList();
        }
        if (employeeId == null) {
            return List.of();
        }
        if (branchId == null) {
            return employeeWarehouseRepository.findByEmployeeIdAndActiveTrueOrderByWarehouseWarehouseName(employeeId).stream()
                    .map(access -> access.getWarehouse().getId())
                    .toList();
        }
        return employeeWarehouseRepository.findByEmployeeIdAndWarehouseBranchIdAndActiveTrue(employeeId, branchId).stream()
                .map(access -> access.getWarehouse().getId())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Long> currentAccessibleWarehouseIds(Long branchId) {
        return getAccessibleWarehouseIds(currentEmployeeIdOrNull(), branchId);
    }

    @Transactional(readOnly = true)
    public void requireView(Long warehouseId) {
        requireAccess(warehouseId, WarehouseAccessLevel.VIEW);
    }

    @Transactional(readOnly = true)
    public void requireOperate(Long warehouseId) {
        requireAccess(warehouseId, WarehouseAccessLevel.OPERATE);
    }

    @Transactional(readOnly = true)
    public void requireManage(Long warehouseId) {
        requireAccess(warehouseId, WarehouseAccessLevel.MANAGE);
    }

    public boolean isPrivileged() {
        AppUser user = branchSecurity.currentUser();
        return branchSecurity.isAdmin(user) || user.getRoles().stream()
                .anyMatch(role -> "INVENTORY_MANAGER".equals(role.getCode()));
    }

    public Long currentEmployeeIdOrNull() {
        if (isPrivileged()) {
            return null;
        }
        AppUser user = branchSecurity.currentUser();
        return employeeRepository.findByUserId(user.getId()).map(employee -> employee.getId()).orElse(null);
    }

    private void requireAccess(Long warehouseId, WarehouseAccessLevel requiredLevel) {
        if (!hasAccess(currentEmployeeIdOrNull(), warehouseId, requiredLevel)) {
            throw new AccessDeniedException("No " + requiredLevel + " access to warehouse " + warehouseId);
        }
    }
}
