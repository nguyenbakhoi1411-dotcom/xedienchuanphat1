package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.BankStatement;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankStatementRepository extends JpaRepository<BankStatement, Long> {

    Page<BankStatement> findByBankAccountIdOrderByNgayImportDesc(Long bankAccountId, Pageable pageable);

    Optional<BankStatement> findByBankAccountIdAndTuNgayAndDenNgay(
            Long bankAccountId, LocalDate tuNgay, LocalDate denNgay);
}
