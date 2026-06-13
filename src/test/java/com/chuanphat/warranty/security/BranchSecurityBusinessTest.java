package com.chuanphat.warranty.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Permission;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class BranchSecurityBusinessTest {
    @Mock AppUserRepository userRepository;

    BranchSecurity branchSecurity;

    @BeforeEach
    void setUp() {
        branchSecurity = new BranchSecurity(userRepository, false);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("staff", "n/a", java.util.List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void branchUserCannotAccessAnotherBranch() {
        when(userRepository.findByUsernameIgnoreCase("staff")).thenReturn(Optional.of(user("staff", "SALES_STAFF", Set.of(new UserBranchAccess(null, 1L, UserBranchAccess.AccessLevel.OPERATE)))));

        assertThat(branchSecurity.scopedBranchId(null)).isEqualTo(1L);
        assertThatThrownBy(() -> branchSecurity.requireBranchAccess(2L)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void viewAllBranchesPermissionCanAccessEveryBranch() {
        Role director = new Role("DIRECTOR", "Director");
        director.getPermissions().add(new Permission("VIEW_ALL_BRANCHES", "BRANCH", "VIEW"));
        AppUser user = user("director", director, Set.of());
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("director", "n/a", java.util.List.of()));
        when(userRepository.findByUsernameIgnoreCase("director")).thenReturn(Optional.of(user));

        branchSecurity.requireBranchAccess(99L);
        assertThat(branchSecurity.scopedBranchId(null)).isNull();
    }

    private AppUser user(String username, String roleCode, Set<UserBranchAccess> accesses) {
        return user(username, new Role(roleCode, roleCode), accesses);
    }

    private AppUser user(String username, Role role, Set<UserBranchAccess> accesses) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setFullName(username);
        user.setPasswordHash("hash");
        user.setRole(role);
        user.replaceBranchAccesses(accesses);
        return user;
    }
}
