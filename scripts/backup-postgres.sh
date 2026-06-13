#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/chuanphat}"
DATABASE_URL="${DATABASE_URL:-postgresql://localhost:5432/chuanphat}"
DATABASE_USERNAME="${DATABASE_USERNAME:-chuanphat}"
LOG_FILE="${BACKUP_LOG_FILE:-$BACKUP_DIR/backup.log}"

mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/chuanphat-$(date +%Y%m%d-%H%M%S).dump"

{
  echo "[$(date --iso-8601=seconds)] backup started: $FILE"
  pg_dump --format=custom --username "$DATABASE_USERNAME" --file "$FILE" "$DATABASE_URL"
  echo "[$(date --iso-8601=seconds)] backup success: $FILE"
} >> "$LOG_FILE" 2>&1 || {
  echo "[$(date --iso-8601=seconds)] backup failed: $FILE" >> "$LOG_FILE"
  exit 1
}
