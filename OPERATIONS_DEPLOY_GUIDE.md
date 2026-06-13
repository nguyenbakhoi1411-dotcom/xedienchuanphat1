# Chuan Phat - Deployment & Operations Guide

## 1. VPS Linux baseline

- Ubuntu 22.04/24.04 LTS.
- Java 17.
- Node.js 20 LTS.
- PostgreSQL 15+.
- Nginx.
- Certbot.

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk postgresql postgresql-client nginx certbot python3-certbot-nginx
```

## 2. PostgreSQL

```bash
sudo -u postgres psql
create database chuanphat;
create user chuanphat with encrypted password 'CHANGE_ME_STRONG_PASSWORD';
grant all privileges on database chuanphat to chuanphat;
\q
```

Production environment:

```bash
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/chuanphat
export DATABASE_USERNAME=chuanphat
export DATABASE_PASSWORD=CHANGE_ME_STRONG_PASSWORD
export JWT_SECRET=CHANGE_ME_64_CHARS_MINIMUM
export BACKUP_DIR=/var/backups/chuanphat
```

Run production SQL migrations before first start:

```bash
psql "$DATABASE_URL" -U "$DATABASE_USERNAME" -f src/main/resources/db/schema-notifications.sql
psql "$DATABASE_URL" -U "$DATABASE_USERNAME" -f src/main/resources/db/schema-operations.sql
```

## 3. Backend systemd service

Copy backend jar to `/opt/chuanphat/warranty-service.jar`.

`/etc/systemd/system/chuanphat-backend.service`:

```ini
[Unit]
Description=Chuan Phat Backend
After=network.target postgresql.service

[Service]
User=www-data
WorkingDirectory=/opt/chuanphat
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/chuanphat
Environment=DATABASE_USERNAME=chuanphat
Environment=DATABASE_PASSWORD=CHANGE_ME_STRONG_PASSWORD
Environment=JWT_SECRET=CHANGE_ME_64_CHARS_MINIMUM
Environment=BACKUP_DIR=/var/backups/chuanphat
Environment=PG_DUMP_PATH=/usr/bin/pg_dump
Environment=PG_RESTORE_PATH=/usr/bin/pg_restore
ExecStart=/usr/bin/java -jar /opt/chuanphat/warranty-service.jar
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /opt/chuanphat /var/backups/chuanphat
sudo chown -R www-data:www-data /opt/chuanphat /var/backups/chuanphat
sudo systemctl daemon-reload
sudo systemctl enable --now chuanphat-backend
```

## 4. Frontend build/deploy

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
```

Deploy `.next`, `public`, `package.json`, and `node_modules`, or run behind PM2/systemd:

```bash
npm run start -- -p 3000
```

## 5. Nginx reverse proxy

Example:

```nginx
server {
    server_name example.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. HTTPS Let's Encrypt

```bash
sudo certbot --nginx -d example.com
sudo systemctl status certbot.timer
```

## 7. Backup cronjob

Copy `scripts/backup-postgres.sh` to `/opt/chuanphat/backup-postgres.sh`.

```bash
sudo chmod +x /opt/chuanphat/backup-postgres.sh
sudo crontab -e
```

Daily 01:30:

```cron
30 1 * * * BACKUP_DIR=/var/backups/chuanphat DATABASE_URL=postgresql://127.0.0.1:5432/chuanphat DATABASE_USERNAME=chuanphat PGPASSWORD=CHANGE_ME_STRONG_PASSWORD /opt/chuanphat/backup-postgres.sh
```

## 8. Manual restore

Restore should be done during maintenance window.

```bash
sudo systemctl stop chuanphat-backend
PGPASSWORD=CHANGE_ME_STRONG_PASSWORD ./scripts/restore-postgres.sh /var/backups/chuanphat/chuanphat-YYYYMMDD-HHMMSS.dump
sudo systemctl start chuanphat-backend
```

The restore script requires typing `RESTORE DATABASE`.

## 9. Operations UI

Admin can open `/operations` to view:

- Backend/database health.
- Disk usage.
- Version/build time/profile.
- Backup button.
- Restore form with danger confirmation.
- Error log filters.
- Audit log old/new values and CSV export.
