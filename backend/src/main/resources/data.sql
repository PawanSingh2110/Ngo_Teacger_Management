INSERT INTO admins (id, full_name, email, password_hash, active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Admin',
    'admin@ngo.org',
    '$2a$12$TgSDfJb3uAEpILAZivx6neJttv7nuUAdas4INSDKl.clvP4eQMvf6',
    true,
    NOW(),
    NOW()
    WHERE NOT EXISTS (
    SELECT 1 FROM admins WHERE email = 'admin@ngo.org'
);