package com.chuanphat.warranty.common.security;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Permission;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import java.util.LinkedHashSet;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class BranchSecurityUnitTest {
    private final AppUserRepository users = mock(AppUserRepository.class);
    private final BranchSecurity branchSecurity = new BranchSecurity(users, false);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void userFromBranchACannotAccessBranchB() {
        AppUser user = user("sales", role("SALES_STAFF"), branchAccess(1L));
        authenticate("sales");
        when(users.findByUsernameIgnoreCase("sales")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> branchSecurity.requireBranchAccess(2L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void viewAllBranchesPermissionCanAccessAnyBranch() {
        AppUser director = user("director", role("DIRECTOR", "VIEW_ALL_BRANCHES"), branchAccess(1L));
        authenticate("director");
        when(users.findByUsernameIgnoreCase("director")).thenReturn(Optional.of(director));

        branchSecurity.requireBranchAccess(2L);
    }

    private static void authenticate(String username) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(username, null, java.util.List.of(new SimpleGrantedAuthority("AUTHENTICATED"))));
    }

    private static AppUser user(String username, Role role, UserBranchAccess... accesses) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setFullName(username);
        user.setEmail(username + "@example.com");
        user.setPasswordHash("{noop}password");
        user.setRoles(new LinkedHashSet<>(java.util.List.of(role)));
        user.replaceBranchAccesses(new LinkedHashSet<>(java.util.List.of(accesses)));
        return user;
    }

    private static Role role(String code, String... permissions) {
        Role role = new Role(code, code);
        for (String permission : permissions) {
            role.getPermissions().add(new Permission(permission, "TEST", "TEST"));
        }
        return role;
    }

    private static UserBranchAccess branchAccess(Long branchId) {
        return new UserBranchAccess(null, branchId, UserBranchAccess.AccessLevel.MANAGE);
    }
}
