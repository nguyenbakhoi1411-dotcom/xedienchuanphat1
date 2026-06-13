package com.chuanphat.warranty.auth.service;

import com.chuanphat.warranty.exception.BusinessException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoginRateLimiter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final Duration window;

    public LoginRateLimiter(
            @Value("${app.security.login-rate-limit.max-attempts:10}") int maxAttempts,
            @Value("${app.security.login-rate-limit.window-seconds:60}") long windowSeconds
    ) {
        this.maxAttempts = maxAttempts;
        this.window = Duration.ofSeconds(windowSeconds);
    }

    public void check(String key) {
        OffsetDateTime now = OffsetDateTime.now();
        Bucket bucket = buckets.compute(key, (ignored, current) -> {
            if (current == null || current.windowStartedAt.plus(window).isBefore(now)) {
                return new Bucket(now, 1);
            }
            return new Bucket(current.windowStartedAt, current.attempts + 1);
        });
        if (bucket.attempts > maxAttempts) {
            throw new BusinessException("Too many login attempts. Please try again later.");
        }
    }

    public void clear(String key) {
        buckets.remove(key);
    }

    private record Bucket(OffsetDateTime windowStartedAt, int attempts) {
    }
}
