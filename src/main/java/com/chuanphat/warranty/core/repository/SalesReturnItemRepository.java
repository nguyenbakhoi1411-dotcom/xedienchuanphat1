package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesReturnItem;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalesReturnItemRepository extends JpaRepository<SalesReturnItem, Long> {
    @Query("""
            select coalesce(sum(item.quantity), 0)
            from SalesReturnItem item
            where item.orderItem.id = :orderItemId
              and item.salesReturn.status in :statuses
            """)
    int sumQuantityByOrderItemIdAndStatuses(
            @Param("orderItemId") Long orderItemId,
            @Param("statuses") Collection<SalesReturnStatus> statuses
    );
}
