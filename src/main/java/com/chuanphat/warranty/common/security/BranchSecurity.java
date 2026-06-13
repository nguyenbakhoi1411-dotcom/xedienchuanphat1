package com.chuanphat.warranty.common.security;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class BranchSecurity {
    private final AppUserRepository userRepository;
    private final boolean strictMode;

    public BranchSecurity(
            AppUserRepository userRepository,
            @Value("${app.security.branch-strict-mode:false}") boolean strictMode
    ) {
        this.userRepository = userRepository;
        this.strictMode = strictMode;
    }

    public AppUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Unauthenticated");
        }
        return userRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }

    public boolean isAdmin(AppUser user) {
        return user.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getCode()) || "SUPER_ADMIN".equals(role.getCode()))
                || hasPermission(user, "VIEW_ALL_BRANCHES");
    }

    public void requireBranchAccess(Long branchId) {
        requireBranchAccess(branchId, UserBranchAccess.AccessLevel.VIEW);
    }

    public void requireBranchAccess(Long branchId, UserBranchAccess.AccessLevel minimumLevel) {
        AppUser user = currentUser();
        if (isAdmin(user)) {
            return;
        }
        if (branchId == null || user.getBranchAccesses().stream().noneMatch(access -> access.getBranchId().equals(branchId) && can(access.getAccessLevel(), minimumLevel))) {
            throw new AccessDeniedException("Cannot access data from another branch");
        }
    }

    public Long scopedBranchId(Long requestedBranchId) {
        return scopedBranchId(requestedBranchId, strictMode);
    }

    public Long scopedBranchId(Long requestedBranchId, boolean strict) {
        AppUser user = currentUser();
        if (isAdmin(user)) {
            return requestedBranchId;
        }
        if (requestedBranchId != null) {
            requireBranchAccess(requestedBranchId);
            return requestedBranchId;
        }
        if (strict) {
            throw new AccessDeniedException("branchId is required in strict branch scope mode");
        }
        return user.getBranchAccesses().stream()
                .findFirst()
                .map(UserBranchAccess::getBranchId)
                .orElseThrow(() -> new AccessDeniedException("User has no branch access"));
    }

    private boolean can(UserBranchAccess.AccessLevel actual, UserBranchAccess.AccessLevel minimum) {
        return weight(actual) >= weight(minimum);
    }

    private int weight(UserBranchAccess.AccessLevel level) {
        return switch (level) {
            case VIEW -> 1;
            case OPERATE -> 2;
            case MANAGE -> 3;
        };
    }

    private boolean hasPermission(AppUser user, String permissionCode) {
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission -> permissionCode.equals(permission.getCode()));
    }

    public java.util.List<Long> accessibleBranchIds() {
        AppUser user = currentUser();
        if (isAdmin(user)) {
            return java.util.List.of();
        }
        return user.getBranchAccesses().stream().map(UserBranchAccess::getBranchId).sorted().toList();
    }

    public void requireAnyBranchAccess(java.util.Collection<Long> branchIds) {
        AppUser user = currentUser();
        if (isAdmin(user)) {
            return;
        }
        for (Long branchId : branchIds) {
            if (branchId != null && user.getBranchAccesses().stream().anyMatch(access -> access.getBranchId().equals(branchId))) {
                return;
            }
        }
        throw new AccessDeniedException("Cannot access data from another branch");
    }
}
