package com.chuanphat.warranty.crm.repository;

import com.chuanphat.warranty.crm.entity.SalesOpportunity;
import com.chuanphat.warranty.crm.enums.OpportunityStage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesOpportunityRepository extends JpaRepository<SalesOpportunity, Long> {
    List<SalesOpportunity> findByStageOrderByExpectedCloseDateAsc(OpportunityStage stage);

    List<SalesOpportunity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<SalesOpportunity> findByLeadIdOrderByCreatedAtDesc(Long leadId);
}
