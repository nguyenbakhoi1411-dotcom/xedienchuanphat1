package com.chuanphat.warranty.auth.service;

import com.chuanphat.warranty.exception.BusinessException;
import java.util.Locale;
import java.util.Set;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordPolicyService {
    private static final Set<String> WEAK_PASSWORDS = Set.of(
            "password", "password1", "password123", "12345678", "123456789",
            "qwerty123", "admin123", "admin@123", "chuanphat123", "changeme"
    );

    public void validateNewPassword(String password, String oldPasswordHash, PasswordEncoder passwordEncoder) {
        if (password == null || password.length() < 8) {
            throw new BusinessException("Password must be at least 8 characters");
        }
        if (WEAK_PASSWORDS.contains(password.toLowerCase(Locale.ROOT))) {
            throw new BusinessException("Password is too weak");
        }
        if (!password.matches(".*[A-Z].*")
                || !password.matches(".*[a-z].*")
                || !password.matches(".*\\d.*")
                || !password.matches(".*[^A-Za-z0-9].*")) {
            throw new BusinessException("Password must include uppercase, lowercase, number and special character");
        }
        if (oldPasswordHash != null && passwordEncoder.matches(password, oldPasswordHash)) {
            throw new BusinessException("New password must be different from the old password");
        }
    }
}
