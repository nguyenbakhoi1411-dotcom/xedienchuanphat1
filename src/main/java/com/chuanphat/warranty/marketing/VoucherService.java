package com.chuanphat.warranty.marketing;

import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.marketing.dto.VoucherRequest;
import com.chuanphat.warranty.marketing.dto.VoucherResponse;
import com.chuanphat.warranty.marketing.entity.Voucher;
import com.chuanphat.warranty.marketing.repository.VoucherRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoucherService {
    private final VoucherRepository repository;

    public VoucherService(VoucherRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> list() {
        return repository.findAll().stream().map(VoucherResponse::from).toList();
    }

    @Transactional
    public VoucherResponse create(VoucherRequest request) {
        repository.findByCodeIgnoreCase(request.code()).ifPresent(item -> {
            throw new BusinessException("Voucher code already exists");
        });
        Voucher voucher = new Voucher();
        apply(voucher, request);
        return VoucherResponse.from(repository.save(voucher));
    }

    @Transactional
    public VoucherResponse update(Long id, VoucherRequest request) {
        Voucher voucher = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher not found: " + id));
        repository.findByCodeIgnoreCase(request.code())
                .filter(item -> !item.getId().equals(id))
                .ifPresent(item -> {
                    throw new BusinessException("Voucher code already exists");
                });
        apply(voucher, request);
        return VoucherResponse.from(repository.save(voucher));
    }

    @Transactional
    public void delete(Long id) {
        Voucher voucher = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher not found: " + id));
        repository.delete(voucher);
    }

    @Transactional(readOnly = true)
    public BigDecimal previewDiscount(String code, Long branchId, List<Long> productIds, BigDecimal subtotal) {
        return validate(code, branchId, productIds, subtotal, false);
    }

    @Transactional
    public BigDecimal consumeDiscount(String code, Long branchId, List<Long> productIds, BigDecimal subtotal) {
        return validate(code, branchId, productIds, subtotal, true);
    }

    private void apply(Voucher voucher, VoucherRequest request) {
        voucher.setCode(request.code());
        voucher.setName(request.name());
        voucher.setDiscountType(request.discountType());
        voucher.setDiscountValue(request.discountValue());
        voucher.setMinimumOrderAmount(request.minimumOrderAmount());
        voucher.setStartDate(request.startDate());
        voucher.setEndDate(request.endDate());
        voucher.setUsageLimit(request.usageLimit());
        voucher.setStatus(request.status());
        voucher.setApplicableProductIds(request.applicableProductIds());
        voucher.setApplicableBranchIds(request.applicableBranchIds());
    }

    private BigDecimal validate(String code, Long branchId, List<Long> productIds, BigDecimal subtotal, boolean consume) {
        if (code == null || code.isBlank()) {
            return BigDecimal.ZERO;
        }
        Voucher voucher = repository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BusinessException("Voucher not found"));
        LocalDate today = LocalDate.now();
        if (!"ACTIVE".equalsIgnoreCase(voucher.getStatus())) {
            throw new BusinessException("Voucher is not active");
        }
        if (voucher.getStartDate() != null && today.isBefore(voucher.getStartDate())) {
            throw new BusinessException("Voucher is not valid yet");
        }
        if (voucher.getEndDate() != null && today.isAfter(voucher.getEndDate())) {
            throw new BusinessException("Voucher is expired");
        }
        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BusinessException("Voucher usage limit reached");
        }
        if (subtotal.compareTo(voucher.getMinimumOrderAmount()) < 0) {
            throw new BusinessException("Order total is below voucher minimum");
        }
        if (!matchesScope(voucher.getApplicableBranchIds(), branchId)) {
            throw new BusinessException("Voucher is not applicable for this branch");
        }
        if (!matchesAnyProduct(voucher.getApplicableProductIds(), productIds)) {
            throw new BusinessException("Voucher is not applicable for selected products");
        }

        BigDecimal discount;
        if ("PERCENT".equalsIgnoreCase(voucher.getDiscountType()) || "PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            discount = subtotal.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = voucher.getDiscountValue();
        }
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        if (consume) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            repository.save(voucher);
        }
        return discount;
    }

    private boolean matchesScope(String rawIds, Long id) {
        Set<Long> ids = parseIds(rawIds);
        return ids.isEmpty() || ids.contains(id);
    }

    private boolean matchesAnyProduct(String rawIds, List<Long> productIds) {
        Set<Long> ids = parseIds(rawIds);
        if (ids.isEmpty()) {
            return true;
        }
        if (productIds == null || productIds.isEmpty()) {
            return false;
        }
        return productIds.stream().anyMatch(ids::contains);
    }

    private Set<Long> parseIds(String rawIds) {
        if (rawIds == null || rawIds.isBlank()) {
            return Set.of();
        }
        return java.util.Arrays.stream(rawIds.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toSet());
    }
}
