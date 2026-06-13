package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.ServiceTicketTimeline;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceTicketTimelineRepository extends JpaRepository<ServiceTicketTimeline, Long> {
    List<ServiceTicketTimeline> findByTicketIdOrderByEventTimeDesc(Long ticketId);
}
