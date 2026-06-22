ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS logout_time TIMESTAMP,
    ADD COLUMN IF NOT EXISTS logout_latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS logout_longitude DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS logout_within_radius BOOLEAN;
