package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.OpeningBalanceResponse;
import com.chuanphat.warranty.accounting.dto.OpeningBalanceRowRequest;
import com.chuanphat.warranty.accounting.entity.AccountingPeriod;
import com.chuanphat.warranty.accounting.entity.OpeningBalance;
import com.chuanphat.warranty.accounting.enums.AccountingPeriodStatus;
import com.chuanphat.warranty.accounting.repository.AccountingPeriodRepository;
import com.chuanphat.warranty.accounting.repository.OpeningBalanceRepository;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OpeningBalanceService {
    private final OpeningBalanceRepository openingBalanceRepository;
    private final AccountingPeriodRepository accountingPeriodRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final BranchRepository branchRepository;
    private final BranchSecurity branchSecurity;

    public OpeningBalanceService(
            OpeningBalanceRepository openingBalanceRepository,
            AccountingPeriodRepository accountingPeriodRepository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            BranchRepository branchRepository,
            BranchSecurity branchSecurity
    ) {
        this.openingBalanceRepository = openingBalanceRepository;
        this.accountingPeriodRepository = accountingPeriodRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.branchRepository = branchRepository;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public List<OpeningBalanceResponse> getOpeningBalances(Long periodId, Long branchId) {
        Long scopedBranch = resolveBranchId(branchId);
        return openingBalanceRepository.findByPeriodIdAndBranchId(periodId, scopedBranch).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<OpeningBalanceResponse> bulkUpsert(List<OpeningBalanceRowRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }

        // Validate all requests are for same period and branch
        Long periodId = requests.get(0).periodId();
        Long branchId = requests.get(0).branchId();

        for (OpeningBalanceRowRequest req : requests) {
            if (!req.periodId().equals(periodId)) {
                throw new BusinessException("Tất cả các dòng phải thuộc cùng một kỳ kế toán.");
            }
            if (!req.branchId().equals(branchId)) {
                throw new BusinessException("Tất cả các dòng phải thuộc cùng một chi nhánh.");
            }
        }

        Long scopedBranch = branchSecurity.scopedBranchId(branchId);
        branchSecurity.requireBranchAccess(scopedBranch);

        AccountingPeriod period = accountingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new BusinessException("Kỳ kế toán không tồn tại."));

        if (period.getStatus() != AccountingPeriodStatus.OPEN) {
            throw new BusinessException("Kỳ kế toán đã đóng hoặc đã bị khóa.");
        }

        if (openingBalanceRepository.existsByPeriodIdAndBranchIdAndLockedAtIsNotNull(periodId, scopedBranch)) {
            throw new BusinessException("Số dư đầu kỳ đã bị khóa cho kỳ này, không thể sửa đổi.");
        }

        // Delete old rows
        openingBalanceRepository.deleteByPeriodIdAndBranchId(periodId, scopedBranch);

        List<OpeningBalance> entities = new ArrayList<>();
        String currentUser = branchSecurity.currentUser().getUsername();

        for (OpeningBalanceRowRequest req : requests) {
            if (req.debitBalance().compareTo(BigDecimal.ZERO) < 0 || req.creditBalance().compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException("Số dư phải lớn hơn hoặc bằng 0.");
            }
            if (req.debitBalance().compareTo(BigDecimal.ZERO) > 0 && req.creditBalance().compareTo(BigDecimal.ZERO) > 0) {
                throw new BusinessException("Không thể nhập đồng thời cả Dư Nợ và Dư Có cho tài khoản " + req.accountCode());
            }

            OpeningBalance ob = new OpeningBalance();
            ob.setPeriod(period);
            ob.setAccountCode(req.accountCode());
            ob.setDebitBalance(req.debitBalance());
            ob.setCreditBalance(req.creditBalance());
            ob.setNote(req.note());
            
            Branch branch = branchRepository.findById(scopedBranch)
                    .orElseThrow(() -> new BusinessException("Chi nhánh không tồn tại."));
            ob.setBranch(branch);
            ob.setCreatedBy(currentUser);

            if (req.customerId() != null) {
                Customer customer = customerRepository.findById(req.customerId())
                        .orElseThrow(() -> new BusinessException("Khách hàng không tồn tại."));
                ob.setCustomer(customer);
            }

            if (req.supplierId() != null) {
                Supplier supplier = supplierRepository.findById(req.supplierId())
                        .orElseThrow(() -> new BusinessException("Nhà cung cấp không tồn tại."));
                ob.setSupplier(supplier);
            }

            entities.add(openingBalanceRepository.save(ob));
        }

        return entities.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<OpeningBalanceResponse> lockOpeningBalances(Long periodId, Long branchId) {
        Long scopedBranch = resolveBranchId(branchId);
        branchSecurity.requireBranchAccess(scopedBranch);

        AccountingPeriod period = accountingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new BusinessException("Kỳ kế toán không tồn tại."));

        List<OpeningBalance> balances = openingBalanceRepository.findByPeriodIdAndBranchId(periodId, scopedBranch);
        if (balances.isEmpty()) {
            throw new BusinessException("Không tìm thấy dữ liệu số dư đầu kỳ để khóa.");
        }

        if (openingBalanceRepository.existsByPeriodIdAndBranchIdAndLockedAtIsNotNull(periodId, scopedBranch)) {
            throw new BusinessException("Số dư đầu kỳ đã được khóa trước đó.");
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (OpeningBalance b : balances) {
            totalDebit = totalDebit.add(b.getDebitBalance());
            totalCredit = totalCredit.add(b.getCreditBalance());
        }

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new BusinessException("Số dư đầu kỳ không cân đối (Tổng Nợ: " + totalDebit + "đ, Tổng Có: " + totalCredit + "đ). Vui lòng kiểm tra lại.");
        }

        OffsetDateTime lockTime = OffsetDateTime.now();
        for (OpeningBalance b : balances) {
            b.setLockedAt(lockTime);
            openingBalanceRepository.save(b);
        }

        return balances.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private OpeningBalanceResponse mapToResponse(OpeningBalance entity) {
        return new OpeningBalanceResponse(
                entity.getId(),
                entity.getPeriod().getId(),
                entity.getAccountCode(),
                entity.getCustomer() != null ? entity.getCustomer().getId() : null,
                entity.getCustomer() != null ? entity.getCustomer().getFullName() : null,
                entity.getSupplier() != null ? entity.getSupplier().getId() : null,
                entity.getSupplier() != null ? entity.getSupplier().getName() : null,
                entity.getDebitBalance(),
                entity.getCreditBalance(),
                entity.getNote(),
                entity.getBranch().getId(),
                entity.getCreatedBy(),
                entity.getLockedAt()
        );
    }

    private Long resolveBranchId(Long requestedBranchId) {
        Long scopedBranch = branchSecurity.scopedBranchId(requestedBranchId);
        if (scopedBranch == null) {
            return branchSecurity.currentUser().getBranchAccesses().stream()
                    .findFirst()
                    .map(UserBranchAccess::getBranchId)
                    .orElseGet(() -> {
                        return branchRepository.findAll().stream()
                                .findFirst()
                                .map(Branch::getId)
                                .orElseThrow(() -> new BusinessException("Hệ thống chưa cấu hình chi nhánh nào."));
                    });
        }
        return scopedBranch;
    }
}
