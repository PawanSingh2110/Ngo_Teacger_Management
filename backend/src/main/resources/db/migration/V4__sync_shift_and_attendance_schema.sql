CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_name VARCHAR(100) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE teachers
    ADD COLUMN IF NOT EXISTS shift_id UUID;

ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS shift_id UUID,
    ADD COLUMN IF NOT EXISTS session_status VARCHAR(20) DEFAULT 'OPEN',
    ADD COLUMN IF NOT EXISTS late BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS late_by_minutes INTEGER,
    ADD COLUMN IF NOT EXISTS check_in_within_radius BOOLEAN,
    ADD COLUMN IF NOT EXISTS check_in_distance_meters DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS logout_distance_meters DOUBLE PRECISION;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_teachers_shift'
    ) THEN
        ALTER TABLE teachers
            ADD CONSTRAINT fk_teachers_shift
            FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_attendance_shift'
    ) THEN
        ALTER TABLE attendance
            ADD CONSTRAINT fk_attendance_shift
            FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teachers_shift_id ON teachers(shift_id);
CREATE INDEX IF NOT EXISTS idx_attendance_shift_id ON attendance(shift_id);
CREATE INDEX IF NOT EXISTS idx_shifts_active ON shifts(active);
