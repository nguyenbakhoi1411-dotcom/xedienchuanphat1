package com.chuanphat.warranty.operations;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import jakarta.persistence.criteria.Predicate;
import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemOperationService {
    private final DataSource dataSource;
    private final Environment environment;
    private final SystemOperationProperties properties;
    private final SystemErrorLogRepository errorLogRepository;
    private final AuditLogService auditLogService;
    private final BranchSecurity branchSecurity;

    public SystemOperationService(
            DataSource dataSource,
            Environment environment,
            SystemOperationProperties properties,
            SystemErrorLogRepository errorLogRepository,
            AuditLogService auditLogService,
            BranchSecurity branchSecurity
    ) {
        this.dataSource = dataSource;
        this.environment = environment;
        this.properties = properties;
        this.errorLogRepository = errorLogRepository;
        this.auditLogService = auditLogService;
        this.branchSecurity = branchSecurity;
    }

    public OperationDtos.SystemHealthResponse health() {
        String databaseStatus = "DOWN";
        try (Connection connection = dataSource.getConnection()) {
            databaseStatus = connection.isValid(2) ? "UP" : "DOWN";
        } catch (Exception exception) {
            recordError(ErrorSeverity.CRITICAL, "SYSTEM", exception, "/api/system/health", "system");
        }

        File root = new File(".").getAbsoluteFile();
        long total = root.getTotalSpace();
        long free = root.getFreeSpace();
        long usable = root.getUsableSpace();
        double usedPercent = total <= 0 ? 0 : ((double) (total - free) / (double) total) * 100;
        return new OperationDtos.SystemHealthResponse(
                "UP",
                databaseStatus,
                new OperationDtos.DiskUsage(total, free, usable, Math.round(usedPercent * 100.0) / 100.0),
                OffsetDateTime.now()
        );
    }

    public OperationDtos.SystemInfoResponse info() {
        return new OperationDtos.SystemInfoResponse(
                properties.getAppVersion(),
                properties.getBuildTime(),
                List.of(environment.getActiveProfiles()),
                System.getProperty("java.version"),
                System.getProperty("os.name")
        );
    }

    public OperationDtos.BackupResponse backup() {
        Path backupDir = backupDir();
        String fileName = "chuanphat-" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".dump";
        Path target = backupDir.resolve(fileName);
        try {
            Files.createDirectories(backupDir);
            ProcessBuilder builder = postgresProcess(properties.getPgDumpPath(), "--format=custom", "--file", target.toString(), databaseUrl());
            builder.redirectErrorStream(true);
            Process process = builder.start();
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new BusinessException("Backup failed: " + safeMessage(output));
            }
            audit(AuditAction.BACKUP, "DATABASE_BACKUP", fileName, "SUCCESS");
            return new OperationDtos.BackupResponse(fileName, target.toString(), Files.size(target), OffsetDateTime.now(), "SUCCESS", "Backup thanh cong");
        } catch (Exception exception) {
            recordError(ErrorSeverity.CRITICAL, "SYSTEM", exception, "/api/system/backup", currentUsername());
            audit(AuditAction.BACKUP, "DATABASE_BACKUP", fileName, "FAILED");
            throw exception instanceof BusinessException businessException ? businessException : new BusinessException("Backup failed: " + exception.getMessage());
        }
    }

    public OperationDtos.BackupResponse restore(OperationDtos.RestoreRequest request) {
        if (!"RESTORE DATABASE".equals(request.confirmation())) {
            throw new BusinessException("Restore requires confirmation: RESTORE DATABASE");
        }
        Path file = backupDir().resolve(request.fileName()).normalize();
        if (!file.startsWith(backupDir()) || !Files.exists(file)) {
            throw new BusinessException("Backup file not found");
        }
        try {
            ProcessBuilder builder = postgresProcess(properties.getPgRestorePath(), "--clean", "--if-exists", "--dbname", databaseUrl(), file.toString());
            builder.redirectErrorStream(true);
            Process process = builder.start();
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new BusinessException("Restore failed: " + safeMessage(output));
            }
            audit(AuditAction.RESTORE, "DATABASE_RESTORE", request.fileName(), "SUCCESS");
            return new OperationDtos.BackupResponse(request.fileName(), file.toString(), Files.size(file), OffsetDateTime.now(), "SUCCESS", "Restore thanh cong");
        } catch (Exception exception) {
            recordError(ErrorSeverity.CRITICAL, "SYSTEM", exception, "/api/system/restore", currentUsername());
            audit(AuditAction.RESTORE, "DATABASE_RESTORE", request.fileName(), "FAILED");
            throw exception instanceof BusinessException businessException ? businessException : new BusinessException("Restore failed: " + exception.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<OperationDtos.ErrorLogResponse> errorLogs(ErrorSeverity severity, String module, OffsetDateTime fromDate, OffsetDateTime toDate, int page, int pageSize) {
        return PageResponse.from(errorLogRepository.findAll(errorSpec(severity, module, fromDate, toDate), PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(pageSize, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt")
        )).map(OperationDtos.ErrorLogResponse::from));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordError(ErrorSeverity severity, String module, Throwable throwable, String path, String username) {
        SystemErrorLog log = new SystemErrorLog();
        log.setSeverity(severity);
        log.setModule(module == null ? "SYSTEM" : module);
        log.setErrorType(throwable.getClass().getSimpleName());
        log.setMessage(safeMessage(throwable.getMessage()));
        log.setPath(path);
        log.setUsername(username);
        log.setStackTrace(stackTrace(throwable));
        errorLogRepository.save(log);
    }

    private Specification<SystemErrorLog> errorSpec(ErrorSeverity severity, String module, OffsetDateTime fromDate, OffsetDateTime toDate) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (severity != null) {
                predicates.add(builder.equal(root.get("severity"), severity));
            }
            if (module != null && !module.isBlank()) {
                predicates.add(builder.equal(root.get("module"), module));
            }
            if (fromDate != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Path backupDir() {
        return Path.of(properties.getBackupDir()).toAbsolutePath().normalize();
    }

    private String databaseUrl() {
        String url = environment.getProperty("spring.datasource.url", "");
        if (url.startsWith("jdbc:postgresql:")) {
            return "postgresql:" + url.substring("jdbc:postgresql:".length());
        }
        if (url.startsWith("postgresql:") || url.startsWith("postgres://")) {
            return url;
        }
        try {
            URI uri = URI.create(url);
            return uri.toString();
        } catch (Exception ignored) {
            return url;
        }
    }

    private ProcessBuilder postgresProcess(String executable, String... args) {
        List<String> command = new ArrayList<>();
        command.add(executable);
        for (String arg : args) {
            command.add(arg);
        }
        String username = environment.getProperty("spring.datasource.username", "");
        if (username != null && !username.isBlank()) {
            command.add("--username");
            command.add(username);
        }
        ProcessBuilder builder = new ProcessBuilder(command);
        String password = environment.getProperty("spring.datasource.password", "");
        if (password != null && !password.isBlank()) {
            builder.environment().put("PGPASSWORD", password);
        }
        return builder;
    }

    private void audit(AuditAction action, String entityType, String entityId, String result) {
        auditLogService.record(new CreateAuditLogRequest(
                currentUsername(),
                action,
                AuditModule.SYSTEM,
                entityType,
                entityId,
                null,
                result,
                null,
                null
        ));
    }

    private String currentUsername() {
        try {
            return branchSecurity.currentUser().getUsername();
        } catch (Exception ignored) {
            return "system";
        }
    }

    private static String stackTrace(Throwable throwable) {
        StringWriter writer = new StringWriter();
        throwable.printStackTrace(new PrintWriter(writer));
        String value = writer.toString();
        return value.length() > 4000 ? value.substring(0, 4000) : value;
    }

    private static String safeMessage(String value) {
        if (value == null || value.isBlank()) {
            return "No detail";
        }
        return value.length() > 1000 ? value.substring(0, 1000) : value;
    }
}
