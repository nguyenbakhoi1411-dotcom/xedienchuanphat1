package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.FixedAssetDtos;
import com.chuanphat.warranty.accounting.entity.FixedAsset;
import com.chuanphat.warranty.accounting.entity.FixedAssetDepreciation;
import com.chuanphat.warranty.accounting.repository.FixedAssetDepreciationRepository;
import com.chuanphat.warranty.accounting.repository.FixedAssetRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FixedAssetService — Quản lý tài sản cố định (TSCĐ).
 *
 * Khấu hao tự động:
 * - STRAIGHT_LINE: khấu hao đều = (nguyên giá - giá trị thanh lý) / tháng hữu dụng
 * - DECLINING_BALANCE: khấu hao giảm dần = giá trị còn lại × tỷ lệ/12
 *
 * runMonthlyDepreciation() idempotent — bỏ qua nếu tháng đã khấu hao.
 */
@Service
public class FixedAssetService {
    private final FixedAssetRepository assetRepository;
    private final FixedAssetDepreciationRepository depreciationRepository;
    private final AccountingLedgerService ledgerService;
    private final AccountingPeriodService periodService;
    private final BranchSecurity branchSecurity;

    public FixedAssetService(
            FixedAssetRepository assetRepository,
            FixedAssetDepreciationRepository depreciationRepository,
            AccountingLedgerService ledgerService,
            AccountingPeriodService periodService,
            BranchSecurity branchSecurity
    ) {
        this.assetRepository = assetRepository;
        this.depreciationRepository = depreciationRepository;
        this.ledgerService = ledgerService;
        this.periodService = periodService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public List<FixedAssetDtos.FixedAssetResponse> list(Long branchId) {
        Long scopedBranch = branchSecurity.scopedBranchId(branchId);
        return assetRepository.findByBranchIdAndStatusNot(
                scopedBranch == null ? 1L : scopedBranch, "DISPOSED")
                .stream().map(FixedAssetDtos.FixedAssetResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public FixedAssetDtos.FixedAssetResponse get(Long id) {
        return FixedAssetDtos.FixedAssetResponse.from(getEntity(id));
    }

    @Transactional
    public FixedAssetDtos.FixedAssetResponse create(FixedAssetDtos.CreateFixedAssetRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        FixedAsset asset = new FixedAsset();
        asset.setAssetCode("FA-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        asset.setAssetName(request.assetName());
        asset.setCategory(request.category());
        asset.setPurchaseDate(request.purchaseDate());
        asset.setCostAmount(request.costAmount());
        asset.setResidualValue(request.residualValue() != null ? request.residualValue() : BigDecimal.ZERO);
        asset.setUsefulLifeMonths(request.usefulLifeMonths());
        asset.setDepreciationMethod(request.depreciationMethod() != null ? request.depreciationMethod() : "STRAIGHT_LINE");
        asset.setBranchId(request.branchId());
        asset.setAccountCode(request.accountCode() != null ? request.accountCode() : "211");
        asset.setDepreciationAccountCode(request.depreciationAccountCode() != null ? request.depreciationAccountCode() : "214");
        asset.setExpenseAccountCode(request.expenseAccountCode() != null ? request.expenseAccountCode() : "642");
        asset.setPurchaseOrderNo(request.purchaseOrderNo());
        asset.setSupplierName(request.supplierName());
        asset.setNote(request.note());
        asset.setCreatedBy(branchSecurity.currentUser().getUsername());
        return FixedAssetDtos.FixedAssetResponse.from(assetRepository.save(asset));
    }

    /**
     * Chạy khấu hao tháng — idempotent.
     * Bỏ qua tài sản đã khấu hao đủ hoặc đã bị thanh lý.
     */
    @Transactional
    public FixedAssetDtos.DepreciationRunResult runMonthlyDepreciation(int year, int month) {
        periodService.assertPeriodNotLocked(LocalDate.of(year, month, 1), null);
        String operator = branchSecurity.currentUser().getUsername();

        List<FixedAsset> activeAssets = assetRepository.findByStatus("ACTIVE");
        List<FixedAssetDtos.DepreciationLineResult> results = new ArrayList<>();
        
        for (FixedAsset asset : activeAssets) {
            // 1. Kiểm tra ngày đưa vào sử dụng
            LocalDate runMonthDate = LocalDate.of(year, month, 1);
            if (asset.getPurchaseDate() != null && asset.getPurchaseDate().withDayOfMonth(1).isAfter(runMonthDate)) {
                results.add(new FixedAssetDtos.DepreciationLineResult(asset.getId(), asset.getAssetCode(), asset.getAssetName(), BigDecimal.ZERO, "SKIPPED_NOT_STARTED"));
                continue;
            }

            // 2. Kiểm tra trạng thái ACTIVE
            if (!"ACTIVE".equals(asset.getStatus())) {
                results.add(new FixedAssetDtos.DepreciationLineResult(asset.getId(), asset.getAssetCode(), asset.getAssetName(), BigDecimal.ZERO, "SKIPPED_NOT_ACTIVE"));
                continue;
            }

            // 3. Kiểm tra số tháng đã khấu hao
            long depreciatedMonths = depreciationRepository.countByAsset_Id(asset.getId());
            if (depreciatedMonths >= asset.getUsefulLifeMonths() || asset.getBookValue().compareTo(asset.getResidualValue()) <= 0) {
                asset.setStatus("FULLY_DEPRECIATED");
                results.add(new FixedAssetDtos.DepreciationLineResult(asset.getId(), asset.getAssetCode(), asset.getAssetName(), BigDecimal.ZERO, "FULLY_DEPRECIATED"));
                continue;
            }

            // Bỏ qua nếu đã khấu hao tháng này (Idempotency check)
            if (depreciationRepository.existsByAsset_IdAndDepreciationYearAndDepreciationMonth(asset.getId(), year, month)) {
                results.add(new FixedAssetDtos.DepreciationLineResult(asset.getId(), asset.getAssetCode(), asset.getAssetName(), BigDecimal.ZERO, "SKIPPED_ALREADY_RUN"));
                continue;
            }

            BigDecimal depreciationAmount = calculateMonthlyDepreciation(asset);
            // Không khấu hao quá giá trị còn lại
            BigDecimal maxDepreciation = asset.getBookValue().subtract(asset.getResidualValue());
            depreciationAmount = depreciationAmount.min(maxDepreciation);

            // Sinh bút toán
            String description = "Khau hao TSCĐ " + asset.getAssetCode() + " T" + month + "/" + year;
            long journalId = ledgerService.postFixedAssetDepreciation(
                    asset.getAssetCode(),
                    LocalDate.of(year, month, 1),
                    depreciationAmount,
                    asset.getExpenseAccountCode(),
                    asset.getDepreciationAccountCode(),
                    asset.getBranchId(),
                    description,
                    operator
            );

            // Lưu bản ghi khấu hao
            FixedAssetDepreciation depr = new FixedAssetDepreciation();
            depr.setAsset(asset);
            depr.setDepreciationMonth(month);
            depr.setDepreciationYear(year);
            depr.setAmount(depreciationAmount);
            depr.setJournalEntryId(journalId);
            depr.setCreatedBy(operator);
            depreciationRepository.save(depr);

            // Cập nhật khấu hao lũy kế
            asset.setAccumulatedDepreciation(asset.getAccumulatedDepreciation().add(depreciationAmount));
            if (asset.getBookValue().compareTo(asset.getResidualValue()) <= 0) {
                asset.setStatus("FULLY_DEPRECIATED");
            }

            results.add(new FixedAssetDtos.DepreciationLineResult(asset.getId(), asset.getAssetCode(), asset.getAssetName(), depreciationAmount, "POSTED"));
        }

        BigDecimal totalDepr = results.stream()
                .map(FixedAssetDtos.DepreciationLineResult::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new FixedAssetDtos.DepreciationRunResult(year, month, results, totalDepr);
    }

    /**
     * Thanh lý TSCĐ.
     */
    @Transactional
    public FixedAssetDtos.FixedAssetResponse dispose(Long assetId, BigDecimal disposalAmount, String note) {
        FixedAsset asset = getEntity(assetId);
        if ("DISPOSED".equals(asset.getStatus())) {
            throw new BusinessException("Asset already disposed");
        }
        asset.setStatus("DISPOSED");
        asset.setDisposedAt(LocalDate.now());
        asset.setDisposedBy(branchSecurity.currentUser().getUsername());
        asset.setDisposalAmount(disposalAmount != null ? disposalAmount : BigDecimal.ZERO);
        if (note != null) asset.setNote(note);
        // Có thể sinh bút toán thanh lý tại đây nếu cần
        return FixedAssetDtos.FixedAssetResponse.from(asset);
    }

    @Transactional(readOnly = true)
    public List<FixedAssetDtos.DepreciationLineResult> depreciationHistory(Long assetId) {
        getEntity(assetId);
        return depreciationRepository.findAll().stream()
                .filter(d -> d.getAsset().getId().equals(assetId))
                .map(d -> new FixedAssetDtos.DepreciationLineResult(
                        assetId, d.getAsset().getAssetCode(), d.getAsset().getAssetName(),
                        d.getAmount(), d.getDepreciationYear() + "/" + d.getDepreciationMonth()))
                .toList();
    }

    private BigDecimal calculateMonthlyDepreciation(FixedAsset asset) {
        BigDecimal depreciableAmount = asset.getCostAmount().subtract(asset.getResidualValue());
        if ("DECLINING_BALANCE".equals(asset.getDepreciationMethod())) {
            // Tỷ lệ khấu hao năm = 1/usefulLifeMonths × 12 × 2 (double-declining)
            BigDecimal annualRate = BigDecimal.valueOf(2.0 * 12 / asset.getUsefulLifeMonths() / 100);
            return asset.getBookValue().multiply(annualRate).divide(BigDecimal.valueOf(12), 0, RoundingMode.HALF_UP);
        }
        // STRAIGHT_LINE
        return depreciableAmount.divide(BigDecimal.valueOf(asset.getUsefulLifeMonths()), 0, RoundingMode.HALF_UP);
    }

    private FixedAsset getEntity(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Fixed asset not found: " + id));
    }
}
