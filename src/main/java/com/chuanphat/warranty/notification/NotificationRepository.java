package com.chuanphat.warranty.notification;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Optional<Notification> findByTypeAndModuleAndEntityId(String type, String module, Long entityId);
}
