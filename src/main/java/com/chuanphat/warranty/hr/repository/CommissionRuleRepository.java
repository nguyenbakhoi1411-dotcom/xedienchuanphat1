package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.CommissionRule;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommissionRuleRepository extends JpaRepository<CommissionRule, Long> {
    @Query("""
            select rule from CommissionRule rule
            where rule.active = true
              and (:positionId is null or rule.positionId is null or rule.positionId = :positionId)
              and (rule.minRevenue is null or rule.minRevenue <= :revenue)
            order by rule.minRevenue desc, rule.id desc
            """)
    List<CommissionRule> findApplicable(Long positionId, BigDecimal revenue);
}
