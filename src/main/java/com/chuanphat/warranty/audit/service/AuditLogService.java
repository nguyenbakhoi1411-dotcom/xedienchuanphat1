package com.chuanphat.warranty.audit.service;

import com.chuanphat.warranty.audit.dto.AuditLogFilter;
import com.chuanphat.warranty.audit.dto.AuditLogPageResponse;
import com.chuanphat.warranty.audit.dto.AuditLogResponse;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.entity.AuditLog;
import com.chuanphat.warranty.audit.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public AuditLogPageResponse search(AuditLogFilter filter, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(pageSize, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        Page<AuditLogResponse> result = auditLogRepository.findAll(specification(filter), pageRequest)
                .map(AuditLogResponse::from);

        return new AuditLogPageResponse(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLogResponse record(CreateAuditLogRequest request) {
        AuditLog auditLog = new AuditLog(
                blankToSystem(request.userId()),
                request.action(),
                request.module(),
                request.entityType(),
                request.entityId(),
                request.oldValue(),
                request.newValue(),
                request.ipAddress(),
                request.userAgent()
        );
        return AuditLogResponse.from(auditLogRepository.save(auditLog));
    }

    @Transactional(readOnly = true)
    public byte[] exportCsv(AuditLogFilter filter) {
        StringBuilder builder = new StringBuilder();
        builder.append("id,userId,action,module,entityType,entityId,oldValue,newValue,ipAddress,userAgent,createdAt\n");
        auditLogRepository.findAll(specification(filter), Sort.by(Sort.Direction.DESC, "createdAt"))
                .forEach(item -> builder
                        .append(csv(item.getId())).append(',')
                        .append(csv(item.getUserId())).append(',')
                        .append(csv(item.getAction())).append(',')
                        .append(csv(item.getModule())).append(',')
                        .append(csv(item.getEntityType())).append(',')
                        .append(csv(item.getEntityId())).append(',')
                        .append(csv(item.getOldValue())).append(',')
                        .append(csv(item.getNewValue())).append(',')
                        .append(csv(item.getIpAddress())).append(',')
                        .append(csv(item.getUserAgent())).append(',')
                        .append(csv(item.getCreatedAt()))
                        .append('\n'));
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private Specification<AuditLog> specification(AuditLogFilter filter) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(filter.userId())) {
                predicates.add(builder.equal(root.get("userId"), filter.userId()));
            }
            if (filter.action() != null) {
                predicates.add(builder.equal(root.get("action"), filter.action()));
            }
            if (filter.module() != null) {
                predicates.add(builder.equal(root.get("module"), filter.module()));
            }
            if (hasText(filter.entityType())) {
                predicates.add(builder.equal(root.get("entityType"), filter.entityType()));
            }
            if (hasText(filter.entityId())) {
                predicates.add(builder.equal(root.get("entityId"), filter.entityId()));
            }
            if (filter.fromDate() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("createdAt"), filter.fromDate()));
            }
            if (filter.toDate() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("createdAt"), filter.toDate()));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String blankToSystem(String value) {
        return hasText(value) ? value : "system";
    }

    private static String csv(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value).replace("\"", "\"\"");
        return "\"" + text + "\"";
    }
}
