package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.RecurringJournal;
import com.chuanphat.warranty.core.enums.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringJournalRepository extends JpaRepository<RecurringJournal, Long> {
    Page<RecurringJournal> findByStatusNotAndNameContainingIgnoreCase(
            RecordStatus status, String name, Pageable pageable);
            
    List<RecurringJournal> findByStatus(RecordStatus status);
}
