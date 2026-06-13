# Chuan Phat - Operations Checklist

## Daily

- Check `/operations` backend and database status.
- Check disk usage below 80%.
- Verify latest backup file exists.
- Review CRITICAL error logs.
- Review pending notifications/reminders.

## Weekly

- Test downloading one backup file.
- Confirm backup cron logs show success.
- Review audit logs for restore, permission, export and setting changes.
- Rotate old backups according to retention policy.

## Monthly

- Perform restore drill on staging database.
- Renew and test SSL certificate status.
- Check PostgreSQL size and vacuum/analyze schedule.
- Confirm systemd services restart correctly after reboot.
- Review admin users and permissions.

## Before Restore

- Announce maintenance window.
- Stop backend service.
- Create one fresh backup before restore.
- Verify selected backup file name and timestamp.
- Require confirmation text: `RESTORE DATABASE`.
- Record audit log and keep restore operator name.

## After Restore

- Start backend service.
- Check `/api/system/health`.
- Login and verify dashboard, sales, inventory, accounting.
- Review error logs for startup issues.
- Keep restore file and logs for incident record.
