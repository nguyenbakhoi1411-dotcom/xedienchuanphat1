package com.chuanphat.warranty.auth.service;

import com.chuanphat.warranty.auth.dto.PermissionDto;
import com.chuanphat.warranty.auth.dto.RoleDto;
import com.chuanphat.warranty.auth.dto.UpdateRolePermissionsRequest;
import com.chuanphat.warranty.auth.dto.UserAdminDto;
import com.chuanphat.warranty.auth.dto.UserAdminRequest;
import com.chuanphat.warranty.auth.dto.UserStatusRequest;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Permission;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.auth.entity.UserBranchAccess;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.auth.repository.PermissionRepository;
import com.chuanphat.warranty.auth.repository.RefreshTokenRepository;
import com.chuanphat.warranty.auth.repository.RoleRepository;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.util.LinkedHashSet;
import java.util.Set;
import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAdminService {
    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final PasswordPolicyService passwordPolicyService;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserAdminService(
            AppUserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService,
            PasswordPolicyService passwordPolicyService,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.passwordPolicyService = passwordPolicyService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserAdminDto> users(int page, int pageSize) {
        return PageResponse.from(userRepository.findAll(PageRequest.of(page, pageSize)).map(UserAdminDto::from));
    }

    @Transactional
    public UserAdminDto createUser(UserAdminRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.employeeCode())) {
            throw new BusinessException("Username already exists");
        }
        AppUser user = new AppUser();
        apply(user, request);
        if (request.password() == null || request.password().isBlank()) {
            throw new BusinessException("Password is required");
        }
        passwordPolicyService.validateNewPassword(request.password(), null, passwordEncoder);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AppUser saved = userRepository.save(user);
        audit(AuditAction.CREATE_USER, "AppUser", saved.getId(), null, saved.getUsername());
        return UserAdminDto.from(saved);
    }

    @Transactional
    public UserAdminDto updateUser(Long id, UserAdminRequest request) {
        AppUser user = getUser(id);
        String oldRoles = roleCodes(user);
        String oldBranches = branchIds(user);
        apply(user, request);
        if (request.password() != null && !request.password().isBlank()) {
            passwordPolicyService.validateNewPassword(request.password(), user.getPasswordHash(), passwordEncoder);
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            refreshTokenRepository.revokeActiveTokensByUserId(user.getId(), OffsetDateTime.now());
        }
        AppUser saved = userRepository.save(user);
        if (!oldRoles.equals(roleCodes(saved))) {
            audit(AuditAction.UPDATE_ROLE, "AppUser", saved.getId(), oldRoles, roleCodes(saved));
        }
        if (!oldBranches.equals(branchIds(saved))) {
            audit(AuditAction.ASSIGN_BRANCH, "AppUser", saved.getId(), oldBranches, branchIds(saved));
        }
        audit(AuditAction.UPDATE_USER, "AppUser", saved.getId(), null, saved.getUsername());
        return UserAdminDto.from(saved);
    }

    @Transactional
    public UserAdminDto updateStatus(Long id, UserStatusRequest request) {
        AppUser user = getUser(id);
        String oldStatus = user.getStatus().name();
        user.setStatus(request.status().equals("LOCKED") ? AppUser.Status.INACTIVE : AppUser.Status.valueOf(request.status()));
        AppUser saved = userRepository.save(user);
        audit(AuditAction.UPDATE_ACCOUNT_STATUS, "AppUser", saved.getId(), oldStatus, saved.getStatus().name());
        return UserAdminDto.from(saved);
    }

    @Transactional(readOnly = true)
    public java.util.List<RoleDto> roles() {
        return roleRepository.findAll().stream().map(RoleDto::from).toList();
    }

    @Transactional
    public RoleDto updateRolePermissions(String code, UpdateRolePermissionsRequest request) {
        Role role = roleRepository.findByCode(code).orElseThrow(() -> new NotFoundException("Role not found: " + code));
        role.getPermissions().clear();
        for (String permissionCode : request.permissions()) {
            Permission permission = permissionRepository.findByCode(permissionCode).orElseThrow(() -> new NotFoundException("Permission not found: " + permissionCode));
            role.getPermissions().add(permission);
        }
        Role saved = roleRepository.save(role);
        audit(AuditAction.UPDATE_PERMISSION, "Role", saved.getId(), code, String.join(",", request.permissions()));
        return RoleDto.from(saved);
    }

    @Transactional(readOnly = true)
    public java.util.List<PermissionDto> permissions() {
        return permissionRepository.findAll().stream().map(PermissionDto::from).toList();
    }

    private void apply(AppUser user, UserAdminRequest request) {
        user.setUsername(request.employeeCode());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        Set<Role> roles = new LinkedHashSet<>();
        for (String roleCode : request.roles()) {
            roles.add(roleRepository.findByCode(roleCode).orElseThrow(() -> new NotFoundException("Role not found: " + roleCode)));
        }
        user.setRoles(roles);
        Set<UserBranchAccess> branchAccesses = new LinkedHashSet<>();
        if (request.branchAccesses() != null && !request.branchAccesses().isEmpty()) {
            for (var access : request.branchAccesses()) {
                branchAccesses.add(new UserBranchAccess(
                        user,
                        access.branchId(),
                        UserBranchAccess.AccessLevel.valueOf(access.accessLevel())
                ));
            }
        } else if (request.branchIds() != null) {
            for (Long branchId : request.branchIds()) {
                branchAccesses.add(new UserBranchAccess(user, branchId, UserBranchAccess.AccessLevel.MANAGE));
            }
        }
        user.replaceBranchAccesses(branchAccesses);
        user.setStatus(request.status() == null || request.status().equals("LOCKED") ? AppUser.Status.INACTIVE : AppUser.Status.valueOf(request.status()));
    }

    private AppUser getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private String roleCodes(AppUser user) {
        return String.join(",", user.getRoles().stream().map(Role::getCode).sorted().toList());
    }

    private String branchIds(AppUser user) {
        return String.join(",", user.getBranchAccesses().stream().map(access -> access.getBranchId().toString()).sorted().toList());
    }

    private void audit(AuditAction action, String entityType, Long entityId, String oldValue, String newValue) {
        auditLogService.record(new CreateAuditLogRequest(
                currentActor(),
                action,
                AuditModule.AUTH,
                entityType,
                entityId == null ? null : entityId.toString(),
                oldValue,
                newValue,
                null,
                null
        ));
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "system";
        }
        return authentication.getName();
    }
}
