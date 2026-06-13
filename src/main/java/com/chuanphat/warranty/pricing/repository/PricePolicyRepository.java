package com.chuanphat.warranty.pricing.repository;

import com.chuanphat.warranty.pricing.entity.PricePolicy;
import com.chuanphat.warranty.pricing.enums.PricePolicyStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PricePolicyRepository extends JpaRepository<PricePolicy, Long> {
    boolean existsByPolicyCodeIgnoreCase(String policyCode);

    @EntityGraph(attributePaths = "targets")
    Optional<PricePolicy> findWithTargetsById(Long id);

    @EntityGraph(attributePaths = "targets")
    List<PricePolicy> findByStatusOrderByCreatedAtDesc(PricePolicyStatus status);

    @EntityGraph(attributePaths = "targets")
    @Query("""
            select policy from PricePolicy policy
            where policy.status in :statuses
              and policy.startDate <= :date
              and policy.endDate >= :date
            order by policy.priority desc, policy.createdAt desc
            """)
    List<PricePolicy> findEffectiveCandidates(Collection<PricePolicyStatus> statuses, LocalDate date);
}
