package com.chuanphat.warranty.crm.repository;

import com.chuanphat.warranty.crm.entity.Lead;
import com.chuanphat.warranty.crm.enums.LeadSource;
import com.chuanphat.warranty.crm.enums.LeadStatus;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    Page<Lead> findByLeadNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(
            String leadName, String phone, Pageable pageable);

    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);

    List<Lead> findByStatus(LeadStatus status);

    /** Lead quá N ngày chưa cập nhật (stale) */
    List<Lead> findByStatusNotInAndUpdatedAtBefore(List<LeadStatus> excludeStatuses, OffsetDateTime cutoff);

    /** Lead đã báo giá quá N ngày chưa WON */
    List<Lead> findByStatusAndUpdatedAtBefore(LeadStatus status, OffsetDateTime cutoff);

    long countByStatus(LeadStatus status);

    @Query("select lead.source as source, count(lead) as total from Lead lead group by lead.source")
    List<SourceCountRow> countBySource();

    interface SourceCountRow {
        LeadSource getSource();
        long getTotal();
    }
}
