package com.chuanphat.warranty.operations;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.operations")
public class SystemOperationProperties {
    private String backupDir = "backups";
    private String pgDumpPath = "pg_dump";
    private String pgRestorePath = "pg_restore";
    private String appVersion = "0.0.1-SNAPSHOT";
    private String buildTime = "local";

    public String getBackupDir() { return backupDir; }
    public void setBackupDir(String backupDir) { this.backupDir = backupDir; }
    public String getPgDumpPath() { return pgDumpPath; }
    public void setPgDumpPath(String pgDumpPath) { this.pgDumpPath = pgDumpPath; }
    public String getPgRestorePath() { return pgRestorePath; }
    public void setPgRestorePath(String pgRestorePath) { this.pgRestorePath = pgRestorePath; }
    public String getAppVersion() { return appVersion; }
    public void setAppVersion(String appVersion) { this.appVersion = appVersion; }
    public String getBuildTime() { return buildTime; }
    public void setBuildTime(String buildTime) { this.buildTime = buildTime; }
}
