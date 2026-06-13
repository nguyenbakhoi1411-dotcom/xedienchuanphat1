package com.chuanphat.warranty.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private NotificationRecipientRepository recipientRepository;
    @Mock
    private ReminderRepository reminderRepository;
    @Mock
    private AppUserRepository userRepository;
    @Mock
    private BranchSecurity branchSecurity;

    private NotificationService service;

    @BeforeEach
    void setUp() {
        service = new NotificationService(notificationRepository, recipientRepository, reminderRepository, userRepository, branchSecurity);
    }

    @Test
    void notifyAllOnceCreatesNotificationAndRecipientsForActiveUsers() {
        AppUser active = user(1L, "sales", AppUser.Status.ACTIVE);
        AppUser inactive = user(2L, "old", AppUser.Status.INACTIVE);
        when(notificationRepository.findByTypeAndModuleAndEntityId("LOW_STOCK", "INVENTORY", 10L)).thenReturn(Optional.empty());
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            ReflectionTestUtils.setField(notification, "id", 99L);
            return notification;
        });
        when(userRepository.findAll()).thenReturn(List.of(active, inactive));
        when(recipientRepository.existsByNotification_IdAndUsername(99L, "sales")).thenReturn(false);

        Notification notification = service.notifyAllOnce(
                "LOW_STOCK",
                NotificationSeverity.WARNING,
                "INVENTORY",
                10L,
                "Ton kho thap",
                "San pham sap het hang"
        );

        assertThat(notification.getId()).isEqualTo(99L);
        ArgumentCaptor<NotificationRecipient> captor = ArgumentCaptor.forClass(NotificationRecipient.class);
        verify(recipientRepository).save(captor.capture());
        assertThat(captor.getValue().getUsername()).isEqualTo("sales");
        assertThat(captor.getValue().getNotification()).isSameAs(notification);
    }

    @Test
    void markReadSetsReadAtForCurrentUserRecipient() {
        AppUser currentUser = user(1L, "manager", AppUser.Status.ACTIVE);
        NotificationRecipient recipient = new NotificationRecipient();
        when(branchSecurity.currentUser()).thenReturn(currentUser);
        when(recipientRepository.findByNotification_IdAndUsername(8L, "manager")).thenReturn(Optional.of(recipient));

        service.markRead(8L);

        assertThat(recipient.getReadAt()).isNotNull();
    }

    @Test
    void createReminderDefaultsAssigneeToCurrentUser() {
        AppUser currentUser = user(7L, "care", AppUser.Status.ACTIVE);
        when(branchSecurity.currentUser()).thenReturn(currentUser);
        when(reminderRepository.save(any(Reminder.class))).thenAnswer(invocation -> {
            Reminder reminder = invocation.getArgument(0);
            ReflectionTestUtils.setField(reminder, "id", 12L);
            return reminder;
        });

        NotificationDtos.ReminderResponse response = service.createReminder(new NotificationDtos.ReminderRequest(
                LocalDate.of(2026, 6, 10),
                5L,
                null,
                ReminderType.CALL_CUSTOMER,
                "Goi khach",
                "Xac nhan lich bao duong"
        ));

        assertThat(response.id()).isEqualTo(12L);
        assertThat(response.assignedTo()).isEqualTo(7L);
        assertThat(response.status()).isEqualTo(ReminderStatus.PENDING);
    }

    private AppUser user(Long id, String username, AppUser.Status status) {
        AppUser user = new AppUser();
        ReflectionTestUtils.setField(user, "id", id);
        user.setUsername(username);
        user.setStatus(status);
        return user;
    }
}
