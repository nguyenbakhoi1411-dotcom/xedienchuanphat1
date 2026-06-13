package com.chuanphat.warranty.notification;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    Page<Reminder> findByAssignedToAndStatusOrderByReminderDateAscIdDesc(Long assignedTo, ReminderStatus status, Pageable pageable);

    Page<Reminder> findByAssignedToOrderByReminderDateAscIdDesc(Long assignedTo, Pageable pageable);

    List<Reminder> findByCustomerIdOrderByReminderDateAscIdDesc(Long customerId);

    List<Reminder> findByStatusAndReminderDateLessThanEqual(ReminderStatus status, LocalDate reminderDate);
}
