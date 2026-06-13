package com.chuanphat.warranty.audit.aop;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Objects;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditLogAspect {
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public AuditLogAspect(AuditLogService auditLogService, ObjectMapper objectMapper) {
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(audited)")
    public Object writeAuditLog(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        Object result = joinPoint.proceed();
        HttpServletRequest request = currentRequest();

        auditLogService.record(new CreateAuditLogRequest(
                currentUserId(),
                audited.action(),
                audited.module(),
                audited.entityType(),
                resolveEntityId(joinPoint, audited, result),
                null,
                toJson(result),
                request == null ? null : clientIp(request),
                request == null ? null : request.getHeader("User-Agent")
        ));

        return result;
    }

    private String resolveEntityId(ProceedingJoinPoint joinPoint, Audited audited, Object result) {
        if (!audited.entityIdParam().isBlank()) {
            String fromParam = entityIdFromParam(joinPoint, audited.entityIdParam());
            if (fromParam != null) {
                return fromParam;
            }
        }

        return entityIdFromResult(result);
    }

    private String entityIdFromParam(ProceedingJoinPoint joinPoint, String parameterName) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] names = signature.getParameterNames();
        Object[] values = joinPoint.getArgs();

        for (int index = 0; index < names.length; index++) {
            if (parameterName.equals(names[index])) {
                return Objects.toString(values[index], null);
            }
        }

        return null;
    }

    private String entityIdFromResult(Object result) {
        if (result == null) {
            return null;
        }

        String id = invokeNoArg(result, "id");
        if (id != null) {
            return id;
        }

        return invokeNoArg(result, "sourceNo");
    }

    private String invokeNoArg(Object target, String methodName) {
        try {
            Method method = target.getClass().getMethod(methodName);
            return Objects.toString(method.invoke(target), null);
        } catch (ReflectiveOperationException ignored) {
            return null;
        }
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return Objects.toString(value);
        }
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "anonymous";
        }

        return authentication.getName();
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }

        return null;
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}
