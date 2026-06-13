param(
    [string]$BackupDir = $env:BACKUP_DIR,
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$DatabaseUsername = $env:DATABASE_USERNAME
)

if (-not $BackupDir) { $BackupDir = "D:\ChuanPhat\backups" }
if (-not $DatabaseUrl) { $DatabaseUrl = "postgresql://localhost:5432/chuanphat" }
if (-not $DatabaseUsername) { $DatabaseUsername = "chuanphat" }

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
$file = Join-Path $BackupDir ("chuanphat-{0}.dump" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
$log = Join-Path $BackupDir "backup.log"

try {
    Add-Content -Path $log -Value "[$(Get-Date -Format o)] backup started: $file"
    & pg_dump --format=custom --username $DatabaseUsername --file $file $DatabaseUrl 2>&1 | Add-Content -Path $log
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed with exit code $LASTEXITCODE" }
    Add-Content -Path $log -Value "[$(Get-Date -Format o)] backup success: $file"
} catch {
    Add-Content -Path $log -Value "[$(Get-Date -Format o)] backup failed: $($_.Exception.Message)"
    throw
}
