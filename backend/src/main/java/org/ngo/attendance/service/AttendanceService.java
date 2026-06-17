package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ngo.attendance.dto.request.AttendanceFilterRequest;
import org.ngo.attendance.dto.request.MarkAttendanceRequest;
import org.ngo.attendance.dto.response.AttendanceResponse;
import org.ngo.attendance.dto.response.DashboardStatsResponse;
import org.ngo.attendance.dto.response.MonthlySummaryResponse;
import org.ngo.attendance.dto.response.TeacherDashboardResponse;
import org.ngo.attendance.entity.*;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.exception.LocationValidationException;
import org.ngo.attendance.repository.AttendanceRepository;
import org.ngo.attendance.repository.CenterRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.ngo.attendance.util.GeoUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TeacherRepository teacherRepository;
    private final CenterRepository centerRepository;

    /**
     * MARK ATTENDANCE — separate from login.
     * Validates GPS location against teacher's assigned centers.
     * One record per day enforced via DB unique constraint.
     */
    @Transactional
    public AttendanceResponse markAttendance(String teacherEmail, MarkAttendanceRequest request) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new BusinessException("Teacher not found"));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        // ✅ Time window check — 6 AM to 6 PM only
        LocalTime windowStart = LocalTime.of(6, 0);
        LocalTime windowEnd = LocalTime.of(18, 0);

        if (now.isBefore(windowStart) || now.isAfter(windowEnd)) {
            throw new BusinessException(
                    "Attendance can only be marked between 6:00 AM and 6:00 PM. " +
                            "Current time: " + now.format(DateTimeFormatter.ofPattern("hh:mm a")));
        }

        // Check if attendance already marked today
        if (attendanceRepository.existsByTeacherAndAttendanceDate(teacher, today)) {
            throw new BusinessException(
                    "Attendance already marked for today. You're already marked PRESENT.");
        }

        // Load teacher's assigned centers with location data
        List<Center> assignedCenters = centerRepository.findAllByTeacherId(teacher.getId());

        if (assignedCenters.isEmpty()) {
            throw new BusinessException("You are not assigned to any center. Contact admin.");
        }

        // Find nearest center within allowed radius (Haversine)
        Center matchedCenter = null;
        double minDistance = Double.MAX_VALUE;

        for (Center center : assignedCenters) {
            if (!center.getActive())
                continue;

            /// rember this
            double distance = GeoUtils.calculateDistance(
                    request.getLatitude().doubleValue(), request.getLongitude().doubleValue(),
                    center.getLatitude().doubleValue(), center.getLongitude().doubleValue());

            log.debug("Distance to center '{}': {}m (allowed: {}m)",
                    center.getCenterName(), Math.round(distance * 10.0) / 10.0,
                    center.getRadiusInMeters());

            if (distance <= center.getRadiusInMeters() && distance < minDistance) {
                minDistance = distance;
                matchedCenter = center;
            }
        }

        if (matchedCenter == null) {
            throw new LocationValidationException(
                    "You are outside the allowed center area. " +
                            "Please ensure you are physically present at your assigned center to mark attendance.");
        }

        Attendance attendance = Attendance.builder()
                .teacher(teacher)
                .center(matchedCenter)
                .attendanceDate(today)
                .loginTime(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        return toResponse(attendanceRepository.save(attendance));
    }

    // Teacher views own attendance history
    public Page<AttendanceResponse> getMyAttendance(String email, Pageable pageable) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Teacher not found"));
        return attendanceRepository
                .findByTeacherOrderByAttendanceDateDesc(teacher, pageable)
                .map(this::toResponse);
    }

    // Teacher's today status
    public Optional<AttendanceResponse> getTodayStatus(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Teacher not found"));
        return attendanceRepository
                .findByTeacherAndAttendanceDate(teacher, LocalDate.now())
                .map(this::toResponse);
    }

    // Monthly summary for teacher dashboard
    public List<MonthlySummaryResponse> getMonthlySummary(UUID teacherId) {
        List<Object[]> rows = attendanceRepository.getMonthlySummaryByTeacher(teacherId);
        return rows.stream().map(row -> {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            return MonthlySummaryResponse.builder()
                    .year(year)
                    .month(month)
                    .monthName(Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH))
                    .presentCount(((Number) row[2]).longValue())
                    .absentCount(((Number) row[3]).longValue())
                    .totalDays(((Number) row[2]).longValue() + ((Number) row[3]).longValue())
                    .build();
        }).collect(Collectors.toList());
    }

    // Teacher dashboard
    public TeacherDashboardResponse getTeacherDashboard(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Teacher not found"));

        Optional<Attendance> todayAtt = attendanceRepository
                .findByTeacherAndAttendanceDate(teacher, LocalDate.now());

        List<MonthlySummaryResponse> monthlySummary = getMonthlySummary(teacher.getId());

        long totalPresent = monthlySummary.stream()
                .mapToLong(MonthlySummaryResponse::getPresentCount).sum();
        long totalAbsent = monthlySummary.stream()
                .mapToLong(MonthlySummaryResponse::getAbsentCount).sum();

        return TeacherDashboardResponse.builder()
                .teacherName(teacher.getFullName())
                .todayStatus(todayAtt.map(Attendance::getStatus).orElse(null))
                .todayLoginTime(todayAtt
                        .map(a -> a.getLoginTime() != null ? a.getLoginTime().toString() : null)
                        .orElse(null))
                .totalPresent(totalPresent)
                .totalAbsent(totalAbsent)
                .recentMonthlySummary(monthlySummary.stream().limit(6).collect(Collectors.toList()))
                .build();
    }

    // Admin dashboard stats
    public DashboardStatsResponse getDashboardStats(
            long totalTeachers, long totalCenters, long totalPrograms) {
        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepository
                .countByAttendanceDateAndStatus(today, AttendanceStatus.PRESENT);
        long absentToday = attendanceRepository
                .countByAttendanceDateAndStatus(today, AttendanceStatus.ABSENT);

        List<AttendanceResponse> todayOverview = attendanceRepository
                .findTodayAttendance(today)
                .stream().map(this::toResponse).collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalTeachers(totalTeachers)
                .totalCenters(totalCenters)
                .totalPrograms(totalPrograms)
                .presentToday(presentToday)
                .absentToday(absentToday)
                .todayAttendanceOverview(todayOverview)
                .build();
    }

    // Admin filtered attendance
    public Page<AttendanceResponse> getAttendanceWithFilters(
            AttendanceFilterRequest filter, Pageable pageable) {
        validateFilter(filter);

        // If month/year provided, convert to date range
        LocalDate from = filter.getFromDate();
        LocalDate to = filter.getToDate();

        if (filter.getMonth() != null && filter.getYear() != null) {
            from = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
            to = from.withDayOfMonth(from.lengthOfMonth());
        }

        return attendanceRepository.findAll(
                buildAttendanceSpecification(filter, from, to, true),
                pageable).map(this::toResponse);
    }

    // For Excel export
    public List<AttendanceResponse> getAllForExport(AttendanceFilterRequest filter) {
        validateFilter(filter);

        LocalDate from = filter.getFromDate();
        LocalDate to = filter.getToDate();

        if (filter.getMonth() != null && filter.getYear() != null) {
            from = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
            to = from.withDayOfMonth(from.lengthOfMonth());
        }

        return attendanceRepository.findAll(
                buildAttendanceSpecification(filter, from, to, true)).stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Called by scheduler
    @Transactional
    public void markAbsentForMissingTeachers() {
        LocalDate today = LocalDate.now();
        List<UUID> presentTeacherIds = attendanceRepository.findTeacherIdsWithAttendanceOnDate(today);

        List<Teacher> allActive = teacherRepository.findAllByActiveTrue();

        List<Attendance> absentRecords = allActive.stream()
                .filter(t -> !presentTeacherIds.contains(t.getId()))
                .map(teacher -> Attendance.builder()
                        .teacher(teacher)
                        .center(null)
                        .attendanceDate(today)
                        .loginTime(null)
                        .status(AttendanceStatus.ABSENT)
                        .build())
                .collect(Collectors.toList());

        if (!absentRecords.isEmpty()) {
            attendanceRepository.saveAll(absentRecords);
            log.info("Marked {} teachers as ABSENT for {}", absentRecords.size(), today);
        }
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .teacherId(a.getTeacher().getId())
                .teacherName(a.getTeacher().getFullName())
                .centerId(a.getCenter() != null ? a.getCenter().getId() : null)
                .centerName(a.getCenter() != null ? a.getCenter().getCenterName() : null)
                .attendanceDate(a.getAttendanceDate())
                .loginTime(a.getLoginTime())
                .status(a.getStatus())
                .latitude(a.getLatitude())
                .longitude(a.getLongitude())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private void validateFilter(AttendanceFilterRequest filter) {
        if ((filter.getMonth() == null) != (filter.getYear() == null)) {
            throw new BusinessException("Month and year must be provided together");
        }
        if (filter.getMonth() != null && (filter.getMonth() < 1 || filter.getMonth() > 12)) {
            throw new BusinessException("Month must be between 1 and 12");
        }
        if (filter.getYear() != null && (filter.getYear() < 2000 || filter.getYear() > 2100)) {
            throw new BusinessException("Year must be between 2000 and 2100");
        }
        if (filter.getFromDate() != null && filter.getToDate() != null
                && filter.getFromDate().isAfter(filter.getToDate())) {
            throw new BusinessException("From date cannot be after to date");
        }
    }

    private Specification<Attendance> buildAttendanceSpecification(
            AttendanceFilterRequest filter,
            LocalDate from,
            LocalDate to,
            boolean applyDefaultSort) {
        return (root, query, cb) -> {
            Join<Attendance, Teacher> teacher = root.join("teacher", JoinType.INNER);
            Join<Attendance, Center> center = root.join("center", JoinType.LEFT);
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getTeacherId() != null) {
                predicates.add(cb.equal(teacher.get("id"), filter.getTeacherId()));
            }
            if (filter.getCenterId() != null) {
                predicates.add(cb.equal(center.get("id"), filter.getCenterId()));
            }
            if (filter.getProgramId() != null) {
                Join<Teacher, Program> program = teacher.join("programs", JoinType.INNER);
                predicates.add(cb.equal(program.get("id"), filter.getProgramId()));
            }
            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("attendanceDate"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("attendanceDate"), to));
            }

            if (applyDefaultSort && query.getResultType() != Long.class) {
                query.orderBy(cb.desc(root.get("attendanceDate")), cb.asc(teacher.get("fullName")));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
