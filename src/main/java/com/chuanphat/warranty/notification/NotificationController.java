package com.chuanphat.warranty.notification;

import com.chuanphat.warranty.common.dto.PageResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasAnyRole('ADMIN')")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/api/notifications")
    @PreAuthorize("isAuthenticated()")
    public NotificationDtos.NotificationPageResponse notifications(@RequestParam(defaultValue = "20") int limit) {
        return service.notifications(limit);
    }

    @PatchMapping("/api/notifications/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public void read(@PathVariable Long id) {
        service.markRead(id);
    }

    @PatchMapping("/api/notifications/read-all")
    @PreAuthorize("isAuthenticated()")
    public void readAll() {
        service.markAllRead();
    }

    @GetMapping("/api/reminders")
    @PreAuthorize("isAuthenticated()")
    public PageResponse<NotificationDtos.ReminderResponse> reminders(
            @RequestParam(required = false) ReminderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return service.reminders(status, page, pageSize);
    }

    @GetMapping("/api/customers/{customerId}/reminders")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public List<NotificationDtos.ReminderResponse> customerReminders(@PathVariable Long customerId) {
        return service.customerReminders(customerId);
    }

    @PostMapping("/api/reminders")
    @PreAuthorize("isAuthenticated()")
    public NotificationDtos.ReminderResponse createReminder(@Valid @RequestBody NotificationDtos.ReminderRequest request) {
        return service.createReminder(request);
    }

    @PatchMapping("/api/reminders/{id}/done")
    @PreAuthorize("isAuthenticated()")
    public NotificationDtos.ReminderResponse done(@PathVariable Long id) {
        return service.markReminderDone(id);
    }
}

