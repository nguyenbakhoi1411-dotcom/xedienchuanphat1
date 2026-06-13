package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.SupplierDto;
import com.chuanphat.warranty.core.dto.SupplierRequest;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.SupplierGroup;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.repository.SupplierGroupRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.ConflictException;
import java.math.BigDecimal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * SupplierService — CRUD + cong no NCC.
 */
@Service
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepo;
    private final SupplierGroupRepository groupRepo;

    public SupplierService(SupplierRepository supplierRepo,
                           SupplierGroupRepository groupRepo) {
        this.supplierRepo = supplierRepo;
        this.groupRepo    = groupRepo;
    }

    // ── QUERY ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<SupplierDto> list(String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("name"));
        if (keyword != null && !keyword.isBlank()) {
            return PageResponse.from(
                supplierRepo.findByStatusNotAndNameContainingIgnoreCase(RecordStatus.INACTIVE, keyword, pageable)
                .map(SupplierDto::from));
        }
        return PageResponse.from(supplierRepo.findAll(pageable).map(SupplierDto::from));
    }

    @Transactional(readOnly = true)
    public SupplierDto get(Long id) {
        return SupplierDto.from(findById(id));
    }

    // ── CREATE / UPDATE ────────────────────────────────────────────

    public SupplierDto create(SupplierRequest req) {
        if (supplierRepo.existsByCodeIgnoreCase(req.code())) {
            throw new ConflictException("Mã NCC đã tồn tại: " + req.code());
        }
        Supplier s = new Supplier();
        applyRequest(s, req);
        return SupplierDto.from(supplierRepo.save(s));
    }

    public SupplierDto update(Long id, SupplierRequest req) {
        Supplier s = findById(id);
        if (!s.getCode().equalsIgnoreCase(req.code()) && supplierRepo.existsByCodeIgnoreCase(req.code())) {
            throw new ConflictException("Mã NCC đã tồn tại: " + req.code());
        }
        applyRequest(s, req);
        return SupplierDto.from(supplierRepo.save(s));
    }

    public SupplierDto deactivate(Long id) {
        Supplier s = findById(id);
        s.setStatus(RecordStatus.INACTIVE);
        return SupplierDto.from(supplierRepo.save(s));
    }

    // ── DEBT MANAGEMENT ────────────────────────────────────────────

    /** Cong them cong no (goi sau khi xac nhan phieu nhap). */
    public void increaseDebt(Long supplierId, BigDecimal amount) {
        Supplier s = findById(supplierId);
        s.setCurrentDebt(s.getCurrentDebt().add(amount));
        supplierRepo.save(s);
    }

    /** Giam cong no (goi sau khi thanh toan / tra hang NCC). */
    public void decreaseDebt(Long supplierId, BigDecimal amount) {
        Supplier s = findById(supplierId);
        BigDecimal newDebt = s.getCurrentDebt().subtract(amount).max(BigDecimal.ZERO);
        s.setCurrentDebt(newDebt);
        supplierRepo.save(s);
    }

    // ── PRIVATE ────────────────────────────────────────────────────

    private void applyRequest(Supplier s, SupplierRequest req) {
        s.setCode(req.code());
        s.setName(req.name());
        s.setTaxCode(req.taxCode());
        s.setPhone(req.phone());
        s.setEmail(req.email());
        s.setWebsite(req.website());
        s.setAddress(req.address());
        s.setContactPerson(req.contactPerson());
        s.setCreditLimit(req.creditLimit() != null ? req.creditLimit() : BigDecimal.ZERO);
        s.setPaymentTermsDays(req.paymentTermsDays() > 0 ? req.paymentTermsDays() : 30);
        s.setRating(req.rating());
        s.setNotes(req.notes());
        if (req.groupId() != null) {
            SupplierGroup g = groupRepo.findById(req.groupId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy nhóm NCC: " + req.groupId()));
            s.setGroup(g);
        }
    }

    public Supplier findById(Long id) {
        return supplierRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy nhà cung cấp: " + id));
    }
}
