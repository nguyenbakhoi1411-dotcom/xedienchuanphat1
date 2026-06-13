package com.chuanphat.warranty.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final boolean enabled;

    public EmailService(@Value("${app.mail.enabled:false}") boolean enabled) {
        this.enabled = enabled;
    }

    public void sendPasswordReset(String email, String token) {
        if (!enabled) {
            log.info("Mail disabled. Password reset token for {}: {}", email, token);
            return;
        }

        // Wire JavaMailSender or external provider here in production.
        log.info("Password reset email queued for {}", email);
    }
}
