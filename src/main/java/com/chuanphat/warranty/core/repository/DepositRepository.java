package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Deposit;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepositRepository extends JpaRepository<Deposit, Long> {
    Optional<Deposit> findByDepositCodeAndDeletedFalse(String depositCode);
    List<Deposit> findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(Long customerId);
    List<Deposit> findByBranchIdAndDeletedFalseOrderByCreatedAtDesc(Long branchId);
    List<Deposit> findByStatusAndDeletedFalse(String status);
    boolean existsByDepositCodeAndDeletedFalse(String depositCode);
}
