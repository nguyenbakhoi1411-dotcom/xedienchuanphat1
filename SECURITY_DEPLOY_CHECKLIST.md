# Security Deploy Checklist

## Secrets
- Set `SPRING_PROFILES_ACTIVE=prod`.
- Set `JWT_SECRET` to a random secret with at least 32 characters.
- Do not enable `EXPOSE_RESET_TOKEN` in production.
- Keep database, mail and admin bootstrap credentials outside source control.

## Pre-Deploy Credential Gate
- Generate a new random `JWT_SECRET` for the target environment before the first deploy.
- Do not use any value that has appeared in git history, including old dev defaults or sanitized examples.
- Set the first admin password to a strong unique value through `BOOTSTRAP_ADMIN_PASSWORD`.
- Do not use `Admin@123`, `123456`, or any demo password from repository history in dev, staging, or production.
- Store real `JWT_SECRET`, database passwords, mail credentials, and API keys only in environment variables or the deployment secret manager.
- Warn real users before rotating `JWT_SECRET`; existing JWT access tokens signed with the old secret will become invalid and users must sign in again.
- After the first successful admin login, set `BOOTSTRAP_ADMIN_ENABLED=false` and restart the backend.

## Authentication
- Confirm JWT access token TTL is short via `JWT_ACCESS_TOKEN_SECONDS` (default 900 seconds).
- Confirm refresh token rotation works and old refresh tokens are rejected.
- Confirm logout revokes refresh tokens.
- Confirm password reset and admin password changes revoke active refresh tokens.

## Passwords
- Enforce minimum 8 characters with uppercase, lowercase, number and special character.
- Reject known weak passwords.
- Reject password reuse during reset or admin password change.
- Disable or rotate bootstrap admin password after first deployment.

## Login Protection
- Confirm 5 failed password attempts lock the account for 15 minutes.
- Tune `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` and `LOGIN_RATE_LIMIT_WINDOW_SECONDS` for production traffic.
- Confirm login failure responses do not reveal whether the user exists.
- Monitor audit logs for `LOGIN_FAILED` and `ACCOUNT_LOCKED`.

## Forgot Password
- Reset tokens expire within 15 minutes.
- `MAIL_ENABLED=true` should send reset email through the configured provider.
- Dev-only token logging must be disabled in production logs.

## API Security
- Set `CORS_ALLOWED_ORIGIN_PATTERNS` to explicit production domains only.
- Do not use `*`, `http://*` or `https://*` for production CORS.
- Keep `spring.jpa.open-in-view=false`.
- Keep validation annotations on request DTOs and reject invalid input globally.
- Do not expose stack traces or SQL errors in API responses.
- Add endpoint-level file type allowlists before introducing file upload endpoints; multipart size is capped by `MAX_FILE_SIZE` and `MAX_REQUEST_SIZE`.

## Headers
- Confirm responses include `Content-Security-Policy`.
- Confirm `X-Frame-Options=SAMEORIGIN`.
- Confirm `X-Content-Type-Options=nosniff`.
- Confirm `Referrer-Policy=strict-origin-when-cross-origin`.

## Permissions And Audit
- Keep backend `@PreAuthorize` checks on protected APIs.
- Confirm export report requires `REPORT_EXPORT`.
- Confirm audit logs cover login success/fail, logout, forgot/reset password, report export, user/role/permission changes and settings changes.
- Review audit log retention and backup policy.
