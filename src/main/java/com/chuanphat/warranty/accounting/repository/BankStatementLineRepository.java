package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.BankStatementLine;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BankStatementLineRepository extends JpaRepository<BankStatementLine, Long> {

    List<BankStatementLine> findByStatementIdAndTrangThaiDoiChieu(Long statementId, String trangThai);

    Page<BankStatementLine> findByStatementId(Long statementId, Pageable pageable);

    Page<BankStatementLine> findByStatementIdAndTrangThaiDoiChieu(
            Long statementId, String trangThai, Pageable pageable);

    @Query("select l from BankStatementLine l " +
           "where l.statement.id = :statementId " +
           "  and l.trangThaiDoiChieu = 'UNMATCHED' " +
           "  and abs(l.soTienThu - l.soTienChi) = :amount " +
           "  and l.ngayGiaoDich between :from and :to")
    List<BankStatementLine> findUnmatchedByAmountAndDateRange(
            @Param("statementId") Long statementId,
            @Param("amount") BigDecimal amount,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    long countByStatementIdAndTrangThaiDoiChieu(Long statementId, String status);
}
