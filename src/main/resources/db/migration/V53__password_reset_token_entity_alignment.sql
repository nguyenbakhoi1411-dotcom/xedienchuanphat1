ALTER TABLE password_reset_tokens
    ADD COLUMN IF NOT EXISTS user_id BIGINT,
    ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

UPDATE password_reset_tokens token
SET user_id = app_user.id
FROM app_users app_user
WHERE token.user_id IS NULL
  AND token.username = app_user.username;

UPDATE password_reset_tokens
SET used_at = created_at
WHERE used_at IS NULL
  AND used = TRUE;
