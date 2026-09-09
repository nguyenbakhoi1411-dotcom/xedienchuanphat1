package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.dto.RecurringJournalDto;
import com.chuanphat.warranty.accounting.dto.RecurringJournalRequest;
import com.chuanphat.warranty.accounting.entity.CostCenter;
import com.chuanphat.warranty.accounting.entity.RecurringJournal;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.repository.CostCenterRepository;
import com.chuanphat.warranty.accounting.repository.RecurringJournalRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.exception.BusinessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class RecurringJournalService {

    private final RecurringJournalRepository repository;
    private final CostCenterRepository costCenterRepo;
    private final AccountingLedgerService ledgerService;

    public RecurringJournalService(RecurringJournalRepository repository,
                                   CostCenterRepository costCenterRepo,
                                   AccountingLedgerService ledgerService) {
        this.repository = repository;
        this.costCenterRepo = costCenterRepo;
        this.ledgerService = ledgerService;
    }

    @Transactional(readOnly = true)
    public PageResponse<RecurringJournalDto> list(String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (keyword != null && !keyword.isBlank()) {
            return PageResponse.from(repository.findByStatusNotAndNameContainingIgnoreCase(
                    RecordStatus.INACTIVE, keyword, pageable).map(RecurringJournalDto::from));
        }
        return PageResponse.from(repository.findAll(pageable).map(RecurringJournalDto::from));
    }

    public RecurringJournalDto create(RecurringJournalRequest req) {
        RecurringJournal r = new RecurringJournal();
        r.setName(req.name());
        r.setDescription(req.description());
        r.setDebitAccount(req.debitAccount());
        r.setCreditAccount(req.creditAccount());
        r.setAmount(req.amount());
        r.setStartDate(req.startDate());
        r.setEndDate(req.endDate());
        r.setFrequency(req.frequency());
        
        if (req.costCenterId() != null) {
            CostCenter cc = costCenterRepo.findById(req.costCenterId())
                    .orElseThrow(() -> new BusinessException("Cost Center not found"));
            r.setCostCenter(cc);
        }
        return RecurringJournalDto.from(repository.save(r));
    }

    public RecurringJournalDto update(Long id, RecurringJournalRequest req) {
        RecurringJournal r = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Recurring Journal not found"));
        r.setName(req.name());
        r.setDescription(req.description());
        r.setDebitAccount(req.debitAccount());
        r.setCreditAccount(req.creditAccount());
        r.setAmount(req.amount());
        r.setStartDate(req.startDate());
        r.setEndDate(req.endDate());
        r.setFrequency(req.frequency());
        
        if (req.costCenterId() != null) {
            CostCenter cc = costCenterRepo.findById(req.costCenterId())
                    .orElseThrow(() -> new BusinessException("Cost Center not found"));
            r.setCostCenter(cc);
        } else {
            r.setCostCenter(null);
        }
        return RecurringJournalDto.from(repository.save(r));
    }

    public RecurringJournalDto deactivate(Long id) {
        RecurringJournal r = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Recurring Journal not found"));
        r.setStatus(RecordStatus.INACTIVE);
        return RecurringJournalDto.from(repository.save(r));
    }

    public void runRecurringJournals(LocalDate runDate) {
        List<RecurringJournal> activeJournals = repository.findByStatus(RecordStatus.ACTIVE);
        for (RecurringJournal r : activeJournals) {
            // Check if valid
            if (r.getStartDate() != null && runDate.isBefore(r.getStartDate())) continue;
            if (r.getEndDate() != null && runDate.isAfter(r.getEndDate())) continue;
            
            // Check frequency logic
            if (r.getLastRunDate() != null) {
                if ("MONTHLY".equals(r.getFrequency())) {
                    if (!r.getLastRunDate().plusMonths(1).isBefore(runDate) && !r.getLastRunDate().plusMonths(1).isEqual(runDate)) {
                        continue; // Not yet time for next monthly run
                    }
                } else if ("WEEKLY".equals(r.getFrequency())) {
                    if (!r.getLastRunDate().plusWeeks(1).isBefore(runDate) && !r.getLastRunDate().plusWeeks(1).isEqual(runDate)) {
                        continue;
                    }
                }
            }

            // Create Journal Entry Request
            JournalEntryLineRequest debitLine = new JournalEntryLineRequest(
                    r.getDebitAccount(),
                    r.getAmount(),
                    BigDecimal.ZERO,
                    "Phân bổ định kỳ: " + r.getName(),
                    null, null, r.getCostCenter() != null ? r.getCostCenter().getId() : null
            );
            
            JournalEntryLineRequest creditLine = new JournalEntryLineRequest(
                    r.getCreditAccount(),
                    BigDecimal.ZERO,
                    r.getAmount(),
                    "Phân bổ định kỳ: " + r.getName(),
                    null, null, r.getCostCenter() != null ? r.getCostCenter().getId() : null
            );

            JournalEntryRequest jeReq = new JournalEntryRequest(
                    runDate,
                    JournalReferenceType.ADJUSTMENT,
                    "REC-" + r.getId() + "-" + runDate.toString(),
                    "Hạch toán tự động: " + r.getName(),
                    List.of(debitLine, creditLine)
            );

            var created = ledgerService.createJournalEntry(jeReq);
            ledgerService.postJournalEntry(created.id());

            r.setLastRunDate(runDate);
            repository.save(r);
        }
    }
}
