-- Ensure the seeded administrator can log in with the documented password: Admin@123
UPDATE admins
SET password_hash = '$2a$12$q75DNUyd/bzo9XdieN4zJeA977LBgJyAwd.iP2Vx1YcBza9Ash5v6',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@ngo.org';
