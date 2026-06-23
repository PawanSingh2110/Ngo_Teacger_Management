DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        WHERE con.contype = 'f'
          AND con.conrelid = 'attendance'::regclass
          AND con.confrelid = 'teachers'::regclass
    LOOP
        EXECUTE format('ALTER TABLE attendance DROP CONSTRAINT %I', constraint_name);
    END LOOP;

    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        WHERE con.contype = 'f'
          AND con.conrelid = 'attendance'::regclass
          AND con.confrelid = 'centers'::regclass
    LOOP
        EXECUTE format('ALTER TABLE attendance DROP CONSTRAINT %I', constraint_name);
    END LOOP;

    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        WHERE con.contype = 'f'
          AND con.conrelid = 'teacher_centers'::regclass
    LOOP
        EXECUTE format('ALTER TABLE teacher_centers DROP CONSTRAINT %I', constraint_name);
    END LOOP;

    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        WHERE con.contype = 'f'
          AND con.conrelid = 'teacher_programs'::regclass
    LOOP
        EXECUTE format('ALTER TABLE teacher_programs DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;

ALTER TABLE attendance
    ADD CONSTRAINT fk_attendance_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

ALTER TABLE attendance
    ADD CONSTRAINT fk_attendance_center
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE SET NULL;

ALTER TABLE teacher_centers
    ADD CONSTRAINT fk_teacher_centers_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

ALTER TABLE teacher_centers
    ADD CONSTRAINT fk_teacher_centers_center
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE;

ALTER TABLE teacher_programs
    ADD CONSTRAINT fk_teacher_programs_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

ALTER TABLE teacher_programs
    ADD CONSTRAINT fk_teacher_programs_program
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;
