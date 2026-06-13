package com.chuanphat.warranty.operations;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "system_error_logs")
public class SystemErrorLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ErrorSeverity severity = ErrorSeverity.ERROR;

    @Column(nullable = false, length = 80)
    private String module;

    @Column(nullable = false, length = 180)
    private String errorType;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(length = 1000)
    private String path;

    @Column(length = 80)
    private String username;

    @Column(length = 4000)
    private String stackTrace;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public ErrorSeverity getSeverity() { return severity; }
    public void setSeverity(ErrorSeverity severity) { this.severity = severity; }
    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }
    public String getErrorType() { return errorType; }
    public void setErrorType(String errorType) { this.errorType = errorType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
