package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.AccountingPeriodDtos;
import com.chuanphat.warranty.accounting.entity.AccountingPeriod;
import com.chuanphat.warranty.accounting.enums.AccountingPeriodStatus;
import com.chuanphat.warranty.accounting.repository.AccountingPeriodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountingPeriodService {

    private final AccountingPeriodRepository periodRepository;

    public AccountingPeriodService(AccountingPeriodRepository periodRepository) {
        this.periodRepository = periodRepository;
    }

    public List<AccountingPeriodDtos.PeriodResponse> getAllPeriods() {
        return periodRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public AccountingPeriodDtos.PeriodResponse createPeriod(
            AccountingPeriodDtos.CreatePeriodRequest req, String createdBy) {
        if (periodRepository.existsByPeriodCode(req.periodCode())) {
            throw new IllegalArgumentException("Mã kỳ kế toán đã tồn tại: " + req.periodCode());
        }
        AccountingPeriod period = new AccountingPeriod();
        period.setPeriodCode(req.periodCode());
        period.setMonth(req.month());
        period.setQuarter(req.quarter());
        period.setYear(req.year());
        period.setStartDate(req.startDate());
        period.setEndDate(req.endDate());
        period.setBranchId(req.branchId());
        period.setNote(req.note());
        period.setCreatedBy(createdBy);
        return toResponse(periodRepository.save(period));
    }

    @Transactional
    public AccountingPeriodDtos.PeriodResponse lockPeriod(
            Long id, String lockedBy, String note) {
        AccountingPeriod period = periodRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ kế toán ID: " + id));
        if (period.getStatus() == AccountingPeriodStatus.LOCKED) {
            throw new IllegalStateException("Kỳ kế toán đã bị khóa");
        }
        period.setStatus(AccountingPeriodStatus.LOCKED);
        period.setLockedBy(lockedBy);
        period.setLockedAt(OffsetDateTime.now());
        if (note != null) period.setNote(note);
        return toResponse(periodRepository.save(period));
    }

    @Transactional
    public AccountingPeriodDtos.PeriodResponse unlockPeriod(
            Long id, String unlockedBy, String note) {
        AccountingPeriod period = periodRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ kế toán ID: " + id));
        if (period.getStatus() == AccountingPeriodStatus.OPEN) {
            throw new IllegalStateException("Kỳ kế toán chưa bị khóa");
        }
        period.setStatus(AccountingPeriodStatus.OPEN);
        period.setUnlockedBy(unlockedBy);
        period.setUnlockedAt(OffsetDateTime.now());
        if (note != null) period.setNote(note);
        return toResponse(periodRepository.save(period));
    }

    /**
     * Kiểm tra xem ngày có nằm trong kỳ đã khóa không.
     * Ném exception nếu kỳ đã khóa → dùng trong AccountingService trước khi sửa bút toán.
     */
    public void assertPeriodNotLocked(LocalDate date, Long branchId) {
        periodRepository.findLockedPeriodForDate(date, branchId)
            .ifPresent(period -> {
                throw new IllegalStateException(
                    "Kỳ kế toán '" + period.getPeriodCode() + "' đã bị khóa. " +
                    "Không thể sửa/hủy chứng từ thuộc kỳ này."
                );
            });
    }

    public Long findPeriodIdByDate(LocalDate date, Long branchId) {
        if (date == null) return null;
        return periodRepository.findByBranchIdIsNullOrBranchId(branchId).stream()
            .filter(p -> (p.getStartDate() == null || !date.isBefore(p.getStartDate())) && 
                         (p.getEndDate() == null || !date.isAfter(p.getEndDate())))
            .map(AccountingPeriod::getId)
            .findFirst()
            .orElse(null);
    }

    private AccountingPeriodDtos.PeriodResponse toResponse(AccountingPeriod p) {
        return new AccountingPeriodDtos.PeriodResponse(
            p.getId(), p.getPeriodCode(), p.getMonth(), p.getQuarter(), p.getYear(),
            p.getStartDate(), p.getEndDate(), p.getStatus(), p.getBranchId(),
            p.getLockedBy(), p.getLockedAt(), p.getUnlockedBy(), p.getUnlockedAt(),
            p.getNote(), p.getCreatedAt(), p.getCreatedBy()
        );
    }
}
