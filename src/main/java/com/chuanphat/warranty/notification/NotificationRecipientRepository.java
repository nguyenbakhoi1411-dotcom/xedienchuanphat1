package com.chuanphat.warranty.notification;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {
    @Query("""
            select recipient
            from NotificationRecipient recipient
            join fetch recipient.notification notification
            where recipient.username = :username
            order by notification.createdAt desc
            """)
    List<NotificationRecipient> findRecentByUsername(@Param("username") String username, Pageable pageable);

    Optional<NotificationRecipient> findByNotification_IdAndUsername(Long notificationId, String username);

    long countByUsernameAndReadAtIsNull(String username);

    List<NotificationRecipient> findByUsernameAndReadAtIsNull(String username);

    boolean existsByNotification_IdAndUsername(Long notificationId, String username);
}
