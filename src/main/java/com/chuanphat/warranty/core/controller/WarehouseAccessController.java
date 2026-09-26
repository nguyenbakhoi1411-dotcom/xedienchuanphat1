package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.core.dto.WarehouseAccessDtos;
import com.chuanphat.warranty.core.service.WarehouseAssignmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/warehouse-access")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INVENTORY_MANAGER')")
public class WarehouseAccessController {
    private final WarehouseAssignmentService assignmentService;

    public WarehouseAccessController(WarehouseAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Audited(action = AuditAction.ASSIGN_WAREHOUSE, module = AuditModule.INVENTORY, entityType = "EmployeeWarehouse")
    public WarehouseAccessDtos.WarehouseAccessResponse assign(
            @Valid @RequestBody WarehouseAccessDtos.AssignWarehouseAccessRequest request
    ) {
        return assignmentService.assign(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Audited(action = AuditAction.REVOKE_WAREHOUSE, module = AuditModule.INVENTORY, entityType = "EmployeeWarehouse", entityIdParam = "id")
    public void revoke(@PathVariable Long id) {
        assignmentService.revoke(id);
    }

    @GetMapping
    public List<WarehouseAccessDtos.WarehouseAccessResponse> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long warehouseId
    ) {
        return assignmentService.list(employeeId, warehouseId);
    }
}
