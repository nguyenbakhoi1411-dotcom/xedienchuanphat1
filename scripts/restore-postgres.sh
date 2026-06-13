#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /path/to/chuanphat-YYYYMMDD-HHMMSS.dump"
  exit 1
fi

DATABASE_URL="${DATABASE_URL:-postgresql://localhost:5432/chuanphat}"
DATABASE_USERNAME="${DATABASE_USERNAME:-chuanphat}"
BACKUP_FILE="$1"

echo "DANGER: this will overwrite database data from $BACKUP_FILE"
read -r -p "Type RESTORE DATABASE to continue: " CONFIRMATION
if [[ "$CONFIRMATION" != "RESTORE DATABASE" ]]; then
  echo "Cancelled"
  exit 1
fi

pg_restore --clean --if-exists --username "$DATABASE_USERNAME" --dbname "$DATABASE_URL" "$BACKUP_FILE"
