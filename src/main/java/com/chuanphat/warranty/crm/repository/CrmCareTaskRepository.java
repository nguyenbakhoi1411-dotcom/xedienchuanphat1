package com.chuanphat.warranty.crm.repository;

import com.chuanphat.warranty.crm.entity.CrmCareTask;
import com.chuanphat.warranty.crm.enums.CrmTaskStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CrmCareTaskRepository extends JpaRepository<CrmCareTask, Long> {
    Page<CrmCareTask> findByStatus(CrmTaskStatus status, Pageable pageable);

    List<CrmCareTask> findByCustomerIdOrderByDueDateAscCreatedAtDesc(Long customerId);

    long countByStatusAndDueDateBefore(CrmTaskStatus status, LocalDate dueDate);

    @Query("""
            select task.customerId as customerId, max(task.createdAt) as lastCareAt
            from CrmCareTask task
            where task.customerId is not null
            group by task.customerId
            """)
    List<CustomerCareDateRow> lastCareDates();

    interface CustomerCareDateRow {
        Long getCustomerId();
        OffsetDateTime getLastCareAt();
    }
}
