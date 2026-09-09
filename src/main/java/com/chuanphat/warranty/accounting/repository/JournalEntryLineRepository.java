package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import java.math.BigDecimal;
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

    @Query("""
            select line
            from JournalEntryLine line
            join fetch line.account account
            join fetch line.journalEntry entry
            where entry.status = :status
              and account.accountCode = :accountCode
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate between :fromDate and :toDate
            order by entry.entryDate, entry.id, line.id
            """)
    List<JournalEntryLine> generalLedgerForBranch(
            @Param("accountCode") String accountCode,
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") JournalEntryStatus status
    );

    @Query("""
            select coalesce(sum(line.debitAmount - line.creditAmount), 0)
            from JournalEntryLine line
            join line.journalEntry entry
            where entry.status = 'POSTED'
              and line.account.accountCode = :accountCode
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate < :fromDate
            """)
    BigDecimal getOpeningBalance(
            @Param("accountCode") String accountCode,
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
            select line
            from JournalEntryLine line
            join fetch line.account account
            join fetch line.journalEntry entry
            where entry.status = :status
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate between :fromDate and :toDate
            order by account.accountCode, entry.entryDate, entry.id, line.id
            """)
    List<JournalEntryLine> postedLinesBetweenForBranch(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("branchId") Long branchId,
            @Param("status") JournalEntryStatus status
    );

    @Query("""
            select line.account.accountCode, sum(line.debitAmount), sum(line.creditAmount)
            from JournalEntryLine line
            join line.journalEntry entry
            where entry.status = 'POSTED'
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate < :fromDate
            group by line.account.accountCode
            """)
    List<Object[]> aggregateOpeningBalances(
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
            select line.account.accountCode, sum(line.debitAmount), sum(line.creditAmount)
            from JournalEntryLine line
            join line.journalEntry entry
            where entry.status = 'POSTED'
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate between :fromDate and :toDate
            group by line.account.accountCode
            """)
    List<Object[]> aggregatePeriodTransactions(
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
            select coalesce(sum(line.debitAmount - line.creditAmount), 0)
            from JournalEntryLine line
            join line.journalEntry entry
            where entry.status = 'POSTED'
              and line.account.accountCode like concat(:accountCode, '%')
              and line.customerId = :customerId
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate < :fromDate
            """)
    BigDecimal getOpeningBalanceByCustomer(
            @Param("accountCode") String accountCode,
            @Param("customerId") Long customerId,
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
            select coalesce(sum(line.creditAmount - line.debitAmount), 0)
            from JournalEntryLine line
            join line.journalEntry entry
            where entry.status = 'POSTED'
              and line.account.accountCode like concat(:accountCode, '%')
              and line.supplierId = :supplierId
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate < :fromDate
            """)
    BigDecimal getOpeningBalanceBySupplier(
            @Param("accountCode") String accountCode,
            @Param("supplierId") Long supplierId,
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
            select line
            from JournalEntryLine line
            join fetch line.account account
            join fetch line.journalEntry entry
            where entry.status = :status
              and account.accountCode like concat(:accountCode, '%')
              and line.customerId = :customerId
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate between :fromDate and :toDate
            order by entry.entryDate, entry.id, line.id
            """)
    List<JournalEntryLine> generalLedgerByCustomer(
            @Param("accountCode") String accountCode,
            @Param("customerId") Long customerId,
            @Param("branchId") Long branchId,
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
              and account.accountCode like concat(:accountCode, '%')
              and line.supplierId = :supplierId
              and (:branchId is null or line.branchId = :branchId)
              and entry.entryDate between :fromDate and :toDate
            order by entry.entryDate, entry.id, line.id
            """)
    List<JournalEntryLine> generalLedgerBySupplier(
            @Param("accountCode") String accountCode,
            @Param("supplierId") Long supplierId,
            @Param("branchId") Long branchId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") JournalEntryStatus status
    );
}
