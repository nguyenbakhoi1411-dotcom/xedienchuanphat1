package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.ExpenseDtos;
import com.chuanphat.warranty.accounting.entity.Expense;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.repository.ExpenseRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ExpenseService — Quản lý chi phí vận hành.
 *
 * Luồng:
 *   1. create() → tạo chi phí DRAFT
 *   2. post() → duyệt + sinh bút toán kế toán
 *   3. delete() → chỉ xóa được DRAFT
 */
@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final AccountingLedgerService ledgerService;
    private final AccountingPeriodService periodService;
    private final BranchSecurity branchSecurity;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            AccountingLedgerService ledgerService,
            AccountingPeriodService periodService,
            BranchSecurity branchSecurity
    ) {
        this.expenseRepository = expenseRepository;
        this.ledgerService = ledgerService;
        this.periodService = periodService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public PageResponse<ExpenseDtos.ExpenseResponse> list(Long branchId, String category, int page, int pageSize) {
        Long scopedBranch = branchSecurity.scopedBranchId(branchId);
        if (category != null && !category.isBlank()) {
            return PageResponse.from(expenseRepository.findByBranchIdAndCategory(
                    scopedBranch == null ? 1L : scopedBranch, category, PageRequest.of(page, pageSize))
                    .map(ExpenseDtos.ExpenseResponse::from));
        }
        return PageResponse.from(expenseRepository.findByBranchIdAndStatusNot(
                scopedBranch == null ? 1L : scopedBranch, "CANCELLED", PageRequest.of(page, pageSize))
                .map(ExpenseDtos.ExpenseResponse::from));
    }

    @Transactional
    public ExpenseDtos.ExpenseResponse create(ExpenseDtos.CreateExpenseRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Expense expense = new Expense();
        expense.setExpenseCode("EXP-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        expense.setExpenseDate(request.expenseDate() == null ? LocalDate.now() : request.expenseDate());
        expense.setCategory(request.category());
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setBranchId(request.branchId());
        expense.setAccountCode(request.accountCode() == null ? "642" : request.accountCode());
        expense.setContraAccount(request.contraAccount() == null ? "111" : request.contraAccount());
        expense.setCreatedBy(branchSecurity.currentUser().getUsername());
        return ExpenseDtos.ExpenseResponse.from(expenseRepository.save(expense));
    }

    /**
     * Duyệt chi phí: DRAFT → POSTED + sinh bút toán kế toán.
     */
    @Transactional
    public ExpenseDtos.ExpenseResponse post(Long expenseId) {
        Expense expense = getEntity(expenseId);
        if (!"DRAFT".equals(expense.getStatus())) {
            throw new BusinessException("Only DRAFT expenses can be posted");
        }
        // Kiểm tra kỳ kế toán chưa khóa
        periodService.assertPeriodNotLocked(expense.getExpenseDate(), null);

        // Sinh bút toán kế toán
        String description = "Chi phi " + expense.getCategory() + ": " + expense.getDescription();
        long journalId = ledgerService.postExpense(
                expense.getExpenseCode(),
                expense.getExpenseDate(),
                expense.getAmount(),
                expense.getAccountCode(),
                expense.getContraAccount(),
                expense.getBranchId(),
                description,
                branchSecurity.currentUser().getUsername()
        );

        expense.setStatus("POSTED");
        expense.setPostedBy(branchSecurity.currentUser().getUsername());
        expense.setPostedAt(OffsetDateTime.now());
        expense.setJournalEntryId(journalId);
        return ExpenseDtos.ExpenseResponse.from(expense);
    }

    /**
     * Xóa — chỉ được khi DRAFT.
     */
    @Transactional
    public void delete(Long expenseId) {
        Expense expense = getEntity(expenseId);
        if (!"DRAFT".equals(expense.getStatus())) {
            throw new BusinessException("Only DRAFT expenses can be deleted");
        }
        expenseRepository.delete(expense);
    }

    private Expense getEntity(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Expense not found: " + id));
    }
}
