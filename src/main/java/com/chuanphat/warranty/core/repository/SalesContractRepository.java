package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesContractRepository extends JpaRepository<SalesContract, Long> {
    Optional<SalesContract> findByContractNo(String contractNo);
}
