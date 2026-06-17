-- ============================================================
-- Teacher Attendance Management System - Database Schema
-- PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ADMINS TABLE
-- ============================================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CENTERS TABLE
-- ============================================================
CREATE TABLE centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_in_meters INTEGER NOT NULL DEFAULT 200,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROGRAMS TABLE
-- ============================================================
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TEACHERS TABLE
-- ============================================================
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TEACHER_CENTERS (Many-to-Many)
-- ============================================================
CREATE TABLE teacher_centers (
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teacher_id, center_id)
);

-- ============================================================
-- TEACHER_PROGRAMS (Many-to-Many)
-- ============================================================
CREATE TABLE teacher_programs (
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teacher_id, program_id)
);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    center_id UUID REFERENCES centers(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    login_time TIMESTAMP,
    status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_teacher_attendance_date UNIQUE (teacher_id, attendance_date)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_active ON teachers(active);
CREATE INDEX idx_centers_active ON centers(active);
CREATE INDEX idx_programs_active ON programs(active);
CREATE INDEX idx_attendance_teacher_id ON attendance(teacher_id);
CREATE INDEX idx_attendance_center_id ON attendance(center_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_teacher_date ON attendance(teacher_id, attendance_date);
CREATE INDEX idx_teacher_centers_teacher ON teacher_centers(teacher_id);
CREATE INDEX idx_teacher_centers_center ON teacher_centers(center_id);
CREATE INDEX idx_teacher_programs_teacher ON teacher_programs(teacher_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Super Admin (password: Admin@123)
INSERT INTO admins (full_name, email, password_hash)
VALUES (
    'Super Admin',
    'admin@ngo.org',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.' -- Admin@123
);

-- Sample Centers
INSERT INTO centers (center_name, address, latitude, longitude, radius_in_meters) VALUES
('Andheri Center', 'Andheri East, Mumbai, Maharashtra 400069', 19.1136, 72.8697, 300),
('Santacruz Center', 'Santacruz West, Mumbai, Maharashtra 400054', 19.0748, 72.8450, 300),
('Bandra Center', 'Bandra West, Mumbai, Maharashtra 400050', 19.0596, 72.8295, 250);

-- Sample Programs
INSERT INTO programs (program_name, description) VALUES
('English', 'Basic to advanced English language skills'),
('Mathematics', 'Foundational mathematics for all levels'),
('Computer Basics', 'Introduction to computers and internet'),
('Spoken English', 'Conversational English and communication skills');
