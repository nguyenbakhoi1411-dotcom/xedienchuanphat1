package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.BankAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    Optional<BankAccount> findByAccountNumber(String accountNumber);

    List<BankAccount> findAllByActiveTrue();

    List<BankAccount> findAllByActiveTrueOrderByMaTaiKhoan();

    @Query("select count(a) from BankAccount a where a.maTaiKhoan like 'TK-%'")
    long countByMaTaiKhoanStartingWithTK();

    boolean existsByMaTaiKhoan(String maTaiKhoan);
}
