package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.ProductSerialHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductSerialHistoryRepository extends JpaRepository<ProductSerialHistory, Long> {
    List<ProductSerialHistory> findBySerialIdOrderByCreatedAtDesc(Long serialId);
}
