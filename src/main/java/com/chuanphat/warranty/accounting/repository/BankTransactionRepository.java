package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.BankTransaction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {

    Page<BankTransaction> findByBankAccountIdOrderByNgayGiaoDichDesc(Long bankAccountId, Pageable pageable);

    Page<BankTransaction> findByBankAccountIdAndNgayGiaoDichBetweenOrderByNgayGiaoDichDesc(
            Long bankAccountId, LocalDate from, LocalDate to, Pageable pageable);

    Page<BankTransaction> findByBankAccountIdAndLoaiGiaoDichAndNgayGiaoDichBetweenOrderByNgayGiaoDichDesc(
            Long bankAccountId, String loaiGiaoDich, LocalDate from, LocalDate to, Pageable pageable);

    Optional<BankTransaction> findByMaGiaoDich(String maGiaoDich);

    long countByMaGiaoDichStartingWith(String prefix);

    List<BankTransaction> findByBankAccountIdAndNgayGiaoDichBetweenAndTrangThaiNot(
            Long bankAccountId, LocalDate from, LocalDate to, String trangThai);

    @Query("select t from BankTransaction t " +
           "where t.bankAccount.id = :accountId " +
           "  and t.ngayGiaoDich between :from and :to " +
           "  and t.soTien = :amount " +
           "  and t.trangThaiDoiChieu = 'UNMATCHED' " +
           "  and t.trangThai = 'CONFIRMED'")
    List<BankTransaction> findUnmatchedByAccountAndDateRangeAndAmount(
            @Param("accountId") Long accountId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("amount") BigDecimal amount);

    @Query("select sum(t.soTien) from BankTransaction t " +
           "where t.bankAccount.id = :accountId " +
           "  and t.loaiGiaoDich = :loai " +
           "  and t.ngayGiaoDich between :from and :to " +
           "  and t.trangThai = 'CONFIRMED'")
    BigDecimal sumByAccountAndTypeAndDateRange(
            @Param("accountId") Long accountId,
            @Param("loai") String loai,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
