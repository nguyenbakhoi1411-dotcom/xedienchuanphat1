package com.chuanphat.warranty.crm.repository;

import com.chuanphat.warranty.crm.entity.CustomerCareNote;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CustomerCareNoteRepository extends JpaRepository<CustomerCareNote, Long> {
    List<CustomerCareNote> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("""
            select note.customerId as customerId, max(note.createdAt) as lastCareAt
            from CustomerCareNote note
            group by note.customerId
            """)
    List<CustomerCareDateRow> lastCareDates();

    interface CustomerCareDateRow {
        Long getCustomerId();
        OffsetDateTime getLastCareAt();
    }
}
