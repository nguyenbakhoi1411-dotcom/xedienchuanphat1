package com.chuanphat.warranty.notification;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository recipientRepository;
    private final ReminderRepository reminderRepository;
    private final AppUserRepository userRepository;
    private final BranchSecurity branchSecurity;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationRecipientRepository recipientRepository,
            ReminderRepository reminderRepository,
            AppUserRepository userRepository,
            BranchSecurity branchSecurity
    ) {
        this.notificationRepository = notificationRepository;
        this.recipientRepository = recipientRepository;
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public NotificationDtos.NotificationPageResponse notifications(int limit) {
        String username = branchSecurity.currentUser().getUsername();
        List<NotificationDtos.NotificationResponse> items = recipientRepository
                .findRecentByUsername(username, PageRequest.of(0, Math.min(Math.max(limit, 1), 50)))
                .stream()
                .map(NotificationDtos.NotificationResponse::from)
                .toList();
        return new NotificationDtos.NotificationPageResponse(recipientRepository.countByUsernameAndReadAtIsNull(username), items);
    }

    @Transactional
    public void markRead(Long notificationId) {
        String username = branchSecurity.currentUser().getUsername();
        NotificationRecipient recipient = recipientRepository.findByNotification_IdAndUsername(notificationId, username)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));
        recipient.setReadAt(OffsetDateTime.now());
    }

    @Transactional
    public void markAllRead() {
        String username = branchSecurity.currentUser().getUsername();
        OffsetDateTime now = OffsetDateTime.now();
        recipientRepository.findByUsernameAndReadAtIsNull(username).forEach(recipient -> recipient.setReadAt(now));
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationDtos.ReminderResponse> reminders(ReminderStatus status, int page, int pageSize) {
        AppUser user = branchSecurity.currentUser();
        return PageResponse.from((status == null
                ? reminderRepository.findByAssignedToOrderByReminderDateAscIdDesc(user.getId(), PageRequest.of(page, pageSize))
                : reminderRepository.findByAssignedToAndStatusOrderByReminderDateAscIdDesc(user.getId(), status, PageRequest.of(page, pageSize)))
                .map(NotificationDtos.ReminderResponse::from));
    }

    @Transactional(readOnly = true)
    public List<NotificationDtos.ReminderResponse> customerReminders(Long customerId) {
        return reminderRepository.findByCustomerIdOrderByReminderDateAscIdDesc(customerId)
                .stream()
                .map(NotificationDtos.ReminderResponse::from)
                .toList();
    }

    @Transactional
    public NotificationDtos.ReminderResponse createReminder(NotificationDtos.ReminderRequest request) {
        AppUser user = branchSecurity.currentUser();
        Reminder reminder = new Reminder();
        reminder.setReminderDate(request.reminderDate());
        reminder.setCustomerId(request.customerId());
        reminder.setAssignedTo(request.assignedTo() == null ? user.getId() : request.assignedTo());
        reminder.setType(request.type());
        reminder.setTitle(request.title());
        reminder.setNote(request.note());
        return NotificationDtos.ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public NotificationDtos.ReminderResponse markReminderDone(Long id) {
        Reminder reminder = reminderRepository.findById(id).orElseThrow(() -> new NotFoundException("Reminder not found: " + id));
        reminder.setStatus(ReminderStatus.DONE);
        reminder.setDoneAt(OffsetDateTime.now());
        return NotificationDtos.ReminderResponse.from(reminder);
    }

    @Transactional
    public Notification notifyAllOnce(String type, NotificationSeverity severity, String module, Long entityId, String title, String message) {
        Notification notification = notificationRepository.findByTypeAndModuleAndEntityId(type, module, entityId)
                .orElseGet(() -> {
                    Notification next = new Notification();
                    next.setType(type);
                    next.setSeverity(severity);
                    next.setModule(module);
                    next.setEntityId(entityId);
                    next.setTitle(title);
                    next.setMessage(message);
                    return notificationRepository.save(next);
                });
        userRepository.findAll().stream()
                .filter(user -> user.getStatus() == AppUser.Status.ACTIVE)
                .forEach(user -> ensureRecipient(notification, user.getUsername()));
        return notification;
    }

    private void ensureRecipient(Notification notification, String username) {
        if (recipientRepository.existsByNotification_IdAndUsername(notification.getId(), username)) {
            return;
        }
        NotificationRecipient recipient = new NotificationRecipient();
        recipient.setNotification(notification);
        recipient.setUsername(username);
        recipientRepository.save(recipient);
    }
}
