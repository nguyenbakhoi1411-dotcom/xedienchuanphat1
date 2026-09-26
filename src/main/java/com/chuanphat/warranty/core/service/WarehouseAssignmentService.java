package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.core.dto.WarehouseAccessDtos;
import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.hr.repository.EmployeeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WarehouseAssignmentService {
    private final EmployeeWarehouseRepository accessRepository;
    private final EmployeeRepository employeeRepository;
    private final WarehouseRepository warehouseRepository;

    public WarehouseAssignmentService(
            EmployeeWarehouseRepository accessRepository,
            EmployeeRepository employeeRepository,
            WarehouseRepository warehouseRepository
    ) {
        this.accessRepository = accessRepository;
        this.employeeRepository = employeeRepository;
        this.warehouseRepository = warehouseRepository;
    }

    @Transactional
    public WarehouseAccessDtos.WarehouseAccessResponse assign(WarehouseAccessDtos.AssignWarehouseAccessRequest request) {
        employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new BusinessException("Employee not found: " + request.employeeId()));
        var warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new BusinessException("Warehouse not found: " + request.warehouseId()));
        EmployeeWarehouse access = accessRepository.findByEmployeeIdAndWarehouseId(request.employeeId(), request.warehouseId())
                .orElseGet(EmployeeWarehouse::new);
        access.setEmployeeId(request.employeeId());
        access.setWarehouse(warehouse);
        access.setAccessLevel(request.accessLevel());
        access.setActive(true);
        return WarehouseAccessDtos.WarehouseAccessResponse.from(accessRepository.save(access));
    }

    @Transactional
    public void revoke(Long id) {
        EmployeeWarehouse access = accessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Warehouse assignment not found: " + id));
        access.setActive(false);
        accessRepository.save(access);
    }

    @Transactional(readOnly = true)
    public List<WarehouseAccessDtos.WarehouseAccessResponse> list(Long employeeId, Long warehouseId) {
        if (employeeId != null && warehouseId != null) {
            return accessRepository.findByEmployeeIdAndWarehouseId(employeeId, warehouseId).stream()
                    .map(WarehouseAccessDtos.WarehouseAccessResponse::from)
                    .toList();
        }
        if (employeeId != null) {
            return accessRepository.findByEmployeeIdAndActiveTrueOrderByWarehouseWarehouseName(employeeId).stream()
                    .map(WarehouseAccessDtos.WarehouseAccessResponse::from)
                    .toList();
        }
        if (warehouseId != null) {
            return accessRepository.findByWarehouseIdAndActiveTrueOrderByEmployeeId(warehouseId).stream()
                    .map(WarehouseAccessDtos.WarehouseAccessResponse::from)
                    .toList();
        }
        return accessRepository.findAll().stream()
                .filter(EmployeeWarehouse::isActive)
                .map(WarehouseAccessDtos.WarehouseAccessResponse::from)
                .toList();
    }
}
