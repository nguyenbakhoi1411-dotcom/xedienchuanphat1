package com.chuanphat.warranty.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public final class NotificationDtos {
    private NotificationDtos() {
    }

    public record NotificationResponse(
            Long id,
            String title,
            String message,
            String type,
            NotificationSeverity severity,
            String module,
            Long entityId,
            OffsetDateTime createdAt,
            OffsetDateTime readAt,
            boolean read
    ) {
        public static NotificationResponse from(NotificationRecipient recipient) {
            Notification notification = recipient.getNotification();
            return new NotificationResponse(
                    notification.getId(),
                    notification.getTitle(),
                    notification.getMessage(),
                    notification.getType(),
                    notification.getSeverity(),
                    notification.getModule(),
                    notification.getEntityId(),
                    notification.getCreatedAt(),
                    recipient.getReadAt(),
                    recipient.getReadAt() != null
            );
        }
    }

    public record NotificationPageResponse(long unreadCount, java.util.List<NotificationResponse> items) {
    }

    public record ReminderRequest(
            @NotNull LocalDate reminderDate,
            Long customerId,
            Long assignedTo,
            @NotNull ReminderType type,
            @NotBlank String title,
            String note
    ) {
    }

    public record ReminderResponse(
            Long id,
            LocalDate reminderDate,
            Long customerId,
            Long assignedTo,
            ReminderType type,
            ReminderStatus status,
            String title,
            String note,
            OffsetDateTime createdAt,
            OffsetDateTime doneAt
    ) {
        public static ReminderResponse from(Reminder reminder) {
            return new ReminderResponse(
                    reminder.getId(),
                    reminder.getReminderDate(),
                    reminder.getCustomerId(),
                    reminder.getAssignedTo(),
                    reminder.getType(),
                    reminder.getStatus(),
                    reminder.getTitle(),
                    reminder.getNote(),
                    reminder.getCreatedAt(),
                    reminder.getDoneAt()
            );
        }
    }
}
