package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, Long> {
    @Query("""
            select line
            from JournalEntryLine line
            join fetch line.account account
            join fetch line.journalEntry entry
            where entry.status = :status
              and entry.entryDate between :fromDate and :toDate
            order by account.accountCode, entry.entryDate, entry.id, line.id
            """)
    List<JournalEntryLine> postedLinesBetween(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") JournalEntryStatus status
    );

    @Query("""
            select line
            from JournalEntryLine line
            join fetch line.account account
            join fetch line.journalEntry entry
            where entry.status = :status
              and account.accountCode = :accountCode
              and entry.entryDate between :fromDate and :toDate
            order by entry.entryDate, entry.id, line.id
            """)
    List<JournalEntryLine> generalLedger(
            @Param("accountCode") String accountCode,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") JournalEntryStatus status
    );
}
