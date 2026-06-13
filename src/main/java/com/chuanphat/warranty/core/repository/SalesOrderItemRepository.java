package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem, Long> {
    Optional<SalesOrderItem> findBySerial(ProductSerial serial);

    @Query("""
            select item.pricePolicyId as policyId,
                   item.pricePolicyCode as policyCode,
                   item.pricePolicyName as policyName,
                   count(distinct item.order.id) as orderCount,
                   coalesce(sum(item.lineTotal), 0) as revenue,
                   coalesce(sum(item.policyDiscountAmount), 0) as discountAmount,
                   coalesce(sum(item.lineTotal - (item.product.importPrice * item.quantity)), 0) as estimatedProfit
            from SalesOrderItem item
            where item.pricePolicyId is not null
            group by item.pricePolicyId, item.pricePolicyCode, item.pricePolicyName
            order by coalesce(sum(item.lineTotal), 0) desc
            """)
    List<PricePolicyPerformanceProjection> pricePolicyPerformance();

    interface PricePolicyPerformanceProjection {
        Long getPolicyId();
        String getPolicyCode();
        String getPolicyName();
        long getOrderCount();
        BigDecimal getRevenue();
        BigDecimal getDiscountAmount();
        BigDecimal getEstimatedProfit();
    }
}
