-- Admin account is intentionally not hard-coded in SQL because production
-- passwords and bootstrap identity must come from environment variables.
-- Use BOOTSTRAP_ADMIN_ENABLED=true once, with BOOTSTRAP_ADMIN_* env vars,
-- then disable it after the first successful login.
SELECT 1;
