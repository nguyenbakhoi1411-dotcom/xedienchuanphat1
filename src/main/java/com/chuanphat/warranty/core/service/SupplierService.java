package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
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
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * SupplierService — CRUD + cong no NCC + search autocomplete.
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

    /** Autocomplete: tim theo ten / MST / ma NCC */
    @Transactional(readOnly = true)
    public List<SupplierDto> search(String q) {
        if (q == null || q.isBlank()) {
            var pageable = PageRequest.of(0, 10, Sort.by("name"));
            return supplierRepo.findAll(pageable)
                    .stream().map(SupplierDto::from).collect(Collectors.toList());
        }
        return supplierRepo.findTop10ByStatusAndNameContainingIgnoreCaseOrCodeContainingIgnoreCaseOrTaxCodeContaining(
                RecordStatus.ACTIVE, q, q, q)
                .stream().map(SupplierDto::from).collect(Collectors.toList());
    }

    // ── CREATE / UPDATE ────────────────────────────────────────────

    public SupplierDto create(SupplierRequest req) {
        Supplier s = new Supplier();
        // Tu sinh ma NCC neu khong truyen
        String code = req.code();
        if (code == null || code.isBlank()) {
            code = generateSupplierCode();
        } else if (supplierRepo.existsByCodeIgnoreCase(code)) {
            throw new ConflictException("Mã NCC đã tồn tại: " + code);
        }
        s.setCode(code);
        applyRequest(s, req);
        return SupplierDto.from(supplierRepo.save(s));
    }

    public SupplierDto update(Long id, SupplierRequest req) {
        Supplier s = findById(id);
        if (req.code() != null && !req.code().isBlank()
                && !s.getCode().equalsIgnoreCase(req.code())
                && supplierRepo.existsByCodeIgnoreCase(req.code())) {
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

    public SupplierDto activate(Long id) {
        Supplier s = findById(id);
        s.setStatus(RecordStatus.ACTIVE);
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
        s.setName(req.name());
        s.setTenVietTat(req.tenVietTat());
        s.setTaxCode(req.taxCode());
        s.setPhone(req.phone());
        s.setEmail(req.email());
        s.setWebsite(req.website());
        s.setAddress(req.address());
        s.setTinhThanh(req.tinhThanh());
        s.setContactPerson(req.contactPerson());
        s.setChucVuNguoiLH(req.chucVuNguoiLH());
        s.setDienThoaiNguoiLH(req.dienThoaiNguoiLH());
        s.setEmailNguoiLH(req.emailNguoiLH());
        s.setSoTaiKhoanNH(req.soTaiKhoanNH());
        s.setTenNganHang(req.tenNganHang());
        s.setChiNhanhNH(req.chiNhanhNH());
        s.setCreditLimit(req.creditLimit() != null ? req.creditLimit() : BigDecimal.ZERO);
        s.setPaymentTermsDays(req.paymentTermsDays() > 0 ? req.paymentTermsDays() : 30);
        if (req.phuongThucTT() != null) s.setPhuongThucTT(req.phuongThucTT());
        s.setRating(req.rating());
        s.setNotes(req.notes());
        if (req.groupId() != null) {
            SupplierGroup g = groupRepo.findById(req.groupId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy nhóm NCC: " + req.groupId()));
            s.setGroup(g);
        }
    }

    private String generateSupplierCode() {
        // Lay max sequence tu ma hien co
        long maxSeq = supplierRepo.count() + 1;
        return String.format("NCC-%04d", maxSeq);
    }

    public Supplier findById(Long id) {
        return supplierRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy nhà cung cấp: " + id));
    }
}

