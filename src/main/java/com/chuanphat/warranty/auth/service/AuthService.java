package com.chuanphat.warranty.auth.service;

import com.chuanphat.warranty.auth.dto.AuthUserResponse;
import com.chuanphat.warranty.auth.dto.ForgotPasswordRequest;
import com.chuanphat.warranty.auth.dto.ForgotPasswordResponse;
import com.chuanphat.warranty.auth.dto.LoginRequest;
import com.chuanphat.warranty.auth.dto.LoginResponse;
import com.chuanphat.warranty.auth.dto.RefreshTokenRequest;
import com.chuanphat.warranty.auth.dto.ResetPasswordRequest;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.PasswordResetToken;
import com.chuanphat.warranty.auth.entity.RefreshToken;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.PasswordResetTokenRepository;
import com.chuanphat.warranty.auth.repository.RefreshTokenRepository;
import com.chuanphat.warranty.auth.security.JwtService;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Base64;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final PasswordPolicyService passwordPolicyService;
    private final LoginRateLimiter loginRateLimiter;
    private final boolean exposeResetToken;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            AppUserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService,
            EmailService emailService,
            PasswordPolicyService passwordPolicyService,
            LoginRateLimiter loginRateLimiter,
            @Value("${app.security.password-reset.expose-token:false}") boolean exposeResetToken
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
        this.passwordPolicyService = passwordPolicyService;
        this.loginRateLimiter = loginRateLimiter;
        this.exposeResetToken = exposeResetToken;
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String rateLimitKey = rateLimitKey(request.identifier(), ipAddress);
        loginRateLimiter.check(rateLimitKey);
        AppUser user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCaseOrPhone(
                request.identifier(),
                request.identifier(),
                request.identifier()
        ).orElse(null);

        if (user == null) {
            recordAuthAudit("unknown:" + request.identifier(), AuditAction.LOGIN_FAILED, "User", null, ipAddress, userAgent);
            throw new BusinessException("Invalid username or password");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            recordAuthAudit(user, AuditAction.ACCOUNT_LOCKED, ipAddress, userAgent);
            throw new BusinessException("Invalid username or password");
        }

        if (user.getStatus() != AppUser.Status.ACTIVE || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            registerFailedLogin(user, ipAddress, userAgent);
            throw new BusinessException("Invalid username or password");
        }

        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        loginRateLimiter.clear(rateLimitKey);

        RefreshToken refreshToken = new RefreshToken(
                user,
                randomToken(),
                OffsetDateTime.now().plusDays(request.rememberMe() ? 30 : 7)
        );
        refreshTokenRepository.save(refreshToken);
        recordAuthAudit(user, AuditAction.LOGIN, ipAddress, userAgent);

        return new LoginResponse(jwtService.generateAccessToken(user), refreshToken.getToken(), AuthUserResponse.from(user));
    }

    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request, String ipAddress, String userAgent) {
        RefreshToken token = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BusinessException("Invalid refresh token"));
        if (token.getRevokedAt() != null || token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BusinessException("Refresh token expired");
        }
        AppUser user = token.getUser();
        RefreshToken nextToken = new RefreshToken(user, randomToken(), token.getExpiresAt());
        token.rotateTo(nextToken.getToken());
        refreshTokenRepository.save(token);
        refreshTokenRepository.save(nextToken);
        recordAuthAudit(user, AuditAction.REFRESH_TOKEN, ipAddress, userAgent);
        return new LoginResponse(jwtService.generateAccessToken(user), nextToken.getToken(), AuthUserResponse.from(user));
    }

    @Transactional
    public void logout(String refreshToken, String ipAddress, String userAgent) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
            recordAuthAudit(token.getUser(), AuditAction.LOGOUT, ipAddress, userAgent);
        });
    }

    @Transactional(readOnly = true)
    public AuthUserResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Unauthenticated");
        }
        AppUser user = userRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new NotFoundException("User not found: " + authentication.getName()));
        return AuthUserResponse.from(user);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request, String ipAddress, String userAgent) {
        AppUser user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCaseOrPhone(
                request.identifier(),
                request.identifier(),
                request.identifier()
        ).orElse(null);

        if (user == null) {
            recordAuthAudit("unknown:" + request.identifier(), AuditAction.FORGOT_PASSWORD, "User", null, ipAddress, userAgent);
            return new ForgotPasswordResponse("If the account exists, a reset token has been issued.", null);
        }

        PasswordResetToken token = new PasswordResetToken(user, randomToken(), OffsetDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(token);
        emailService.sendPasswordReset(user.getEmail(), token.getToken());
        recordAuthAudit(user, AuditAction.FORGOT_PASSWORD, ipAddress, userAgent);
        return new ForgotPasswordResponse("If the account exists, a reset token has been issued.", exposeResetToken ? token.getToken() : null);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, String ipAddress, String userAgent) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BusinessException("Invalid reset token"));
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BusinessException("Reset token expired");
        }
        AppUser user = token.getUser();
        passwordPolicyService.validateNewPassword(request.newPassword(), user.getPasswordHash(), passwordEncoder);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        token.markUsed();
        userRepository.save(user);
        passwordResetTokenRepository.save(token);
        refreshTokenRepository.revokeActiveTokensByUserId(user.getId(), OffsetDateTime.now());
        recordAuthAudit(user, AuditAction.RESET_PASSWORD, ipAddress, userAgent);
    }

    private String randomToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void registerFailedLogin(AppUser user, String ipAddress, String userAgent) {
        int failedCount = user.getFailedLoginCount() + 1;
        user.setFailedLoginCount(failedCount);
        recordAuthAudit(user, AuditAction.LOGIN_FAILED, ipAddress, userAgent);
        if (failedCount >= 5) {
            user.setLockedUntil(OffsetDateTime.now().plusMinutes(15));
            recordAuthAudit(user, AuditAction.ACCOUNT_LOCKED, ipAddress, userAgent);
        }
        userRepository.save(user);
    }

    private void recordAuthAudit(AppUser user, AuditAction action, String ipAddress, String userAgent) {
        recordAuthAudit(user.getUsername(), action, "User", user.getId().toString(), ipAddress, userAgent);
    }

    private void recordAuthAudit(String userId, AuditAction action, String entityType, String entityId, String ipAddress, String userAgent) {
        auditLogService.record(new CreateAuditLogRequest(
                userId,
                action,
                AuditModule.AUTH,
                entityType,
                entityId,
                null,
                null,
                ipAddress,
                userAgent
        ));
    }

    private String rateLimitKey(String identifier, String ipAddress) {
        return (identifier == null ? "" : identifier.toLowerCase(Locale.ROOT).trim()) + "|" + (ipAddress == null ? "unknown" : ipAddress);
    }
}
