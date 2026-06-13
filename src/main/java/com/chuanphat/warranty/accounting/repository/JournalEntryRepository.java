package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    Page<JournalEntry> findByStatus(JournalEntryStatus status, Pageable pageable);
    Optional<JournalEntry> findByReferenceTypeAndReferenceIdAndStatus(JournalReferenceType referenceType, String referenceId, JournalEntryStatus status);
    Page<JournalEntry> findByEntryDateBetweenAndStatus(LocalDate fromDate, LocalDate toDate, JournalEntryStatus status, Pageable pageable);

    @Query("""
            select entry from JournalEntry entry
            where (:branchId is null or entry.branchId = :branchId)
              and (:status is null or entry.status = :status)
              and (:fromDate is null or entry.entryDate >= :fromDate)
              and (:toDate is null or entry.entryDate <= :toDate)
              and (
                  :keyword is null
                  or lower(entry.entryCode) like lower(concat('%', :keyword, '%'))
                  or lower(entry.referenceId) like lower(concat('%', :keyword, '%'))
                  or lower(entry.description) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<JournalEntry> search(Long branchId, JournalEntryStatus status, LocalDate fromDate, LocalDate toDate, String keyword, Pageable pageable);
}
