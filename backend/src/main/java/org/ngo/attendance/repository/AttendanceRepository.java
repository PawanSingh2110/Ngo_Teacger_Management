package org.ngo.attendance.repository;

import org.ngo.attendance.entity.Attendance;
import org.ngo.attendance.entity.AttendanceStatus;
import org.ngo.attendance.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID>, JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByTeacherAndAttendanceDate(Teacher teacher, LocalDate date);

    boolean existsByTeacherAndAttendanceDate(Teacher teacher, LocalDate date);

    // All teachers who already have attendance for a date (for scheduler)
    @Query("SELECT a.teacher.id FROM Attendance a WHERE a.attendanceDate = :date")
    List<UUID> findTeacherIdsWithAttendanceOnDate(@Param("date") LocalDate date);

    // Count present/absent today
    long countByAttendanceDateAndStatus(LocalDate date, AttendanceStatus status);

    // Teacher's own attendance history with pagination
    Page<Attendance> findByTeacherOrderByAttendanceDateDesc(Teacher teacher, Pageable pageable);

    // Monthly summary per teacher
    @Query("""
        SELECT
            EXTRACT(YEAR FROM a.attendanceDate) AS year,
            EXTRACT(MONTH FROM a.attendanceDate) AS month,
            SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS presentCount,
            SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) AS absentCount
        FROM Attendance a
        WHERE a.teacher.id = :teacherId
        GROUP BY EXTRACT(YEAR FROM a.attendanceDate), EXTRACT(MONTH FROM a.attendanceDate)
        ORDER BY year DESC, month DESC
    """)
    List<Object[]> getMonthlySummaryByTeacher(@Param("teacherId") UUID teacherId);

    // Admin reports - filter by teacher, center, program, date range
    @Query("""
        SELECT a FROM Attendance a
        JOIN a.teacher t
        LEFT JOIN a.center c
        WHERE (:teacherId IS NULL OR t.id = :teacherId)
        AND (:centerId IS NULL OR c.id = :centerId)
        AND (:status IS NULL OR a.status = :status)
        AND (:fromDate IS NULL OR a.attendanceDate >= :fromDate)
        AND (:toDate IS NULL OR a.attendanceDate <= :toDate)
        ORDER BY a.attendanceDate DESC, t.fullName ASC
    """)
    Page<Attendance> findWithFilters(
        @Param("teacherId") UUID teacherId,
        @Param("centerId") UUID centerId,
        @Param("status") AttendanceStatus status,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        Pageable pageable
    );

    // For Excel export (no pagination)
    @Query("""
        SELECT a FROM Attendance a
        JOIN a.teacher t
        LEFT JOIN a.center c
        WHERE (:teacherId IS NULL OR t.id = :teacherId)
        AND (:centerId IS NULL OR c.id = :centerId)
        AND (:status IS NULL OR a.status = :status)
        AND (:fromDate IS NULL OR a.attendanceDate >= :fromDate)
        AND (:toDate IS NULL OR a.attendanceDate <= :toDate)
        ORDER BY a.attendanceDate DESC
    """)
    List<Attendance> findAllForExport(
        @Param("teacherId") UUID teacherId,
        @Param("centerId") UUID centerId,
        @Param("status") AttendanceStatus status,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    // Today's overview for admin dashboard
    @Query("""
        SELECT a FROM Attendance a
        JOIN FETCH a.teacher t
        LEFT JOIN FETCH a.center c
        WHERE a.attendanceDate = :date
        ORDER BY a.loginTime DESC NULLS LAST
    """)
    List<Attendance> findTodayAttendance(@Param("date") LocalDate date);

    // Monthly aggregate per center
    @Query("""
        SELECT
            c.centerName,
            EXTRACT(YEAR FROM a.attendanceDate) AS year,
            EXTRACT(MONTH FROM a.attendanceDate) AS month,
            SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS presentCount,
            SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) AS absentCount
        FROM Attendance a
        JOIN a.center c
        WHERE (:centerId IS NULL OR c.id = :centerId)
        AND (:fromDate IS NULL OR a.attendanceDate >= :fromDate)
        AND (:toDate IS NULL OR a.attendanceDate <= :toDate)
        GROUP BY c.centerName, EXTRACT(YEAR FROM a.attendanceDate), EXTRACT(MONTH FROM a.attendanceDate)
        ORDER BY year DESC, month DESC
    """)
    List<Object[]> getCenterAttendanceSummary(
        @Param("centerId") UUID centerId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    // Teacher attendance in date range
    @Query("""
        SELECT a FROM Attendance a
        WHERE a.teacher.id = :teacherId
        AND a.attendanceDate BETWEEN :fromDate AND :toDate
        ORDER BY a.attendanceDate ASC
    """)
    List<Attendance> findByTeacherIdAndDateRange(
        @Param("teacherId") UUID teacherId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );
}
