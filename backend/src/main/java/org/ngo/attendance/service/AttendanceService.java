package org.ngo.attendance.service;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
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
import org.ngo.attendance.util.AppClock;
import org.ngo.attendance.util.GeoUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TeacherRepository teacherRepository;
    private final CenterRepository centerRepository;

    @Transactional
    public AttendanceResponse markAttendance(String teacherEmail, MarkAttendanceRequest request) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new BusinessException("Teacher not found"));

        Shift shift = teacher.getShift();
        if (shift == null || !Boolean.TRUE.equals(shift.getActive())) {
            throw new BusinessException("No active shift is assigned to you. Contact admin.");
        }

        LocalDate today = AppClock.today();
        LocalDateTime now = AppClock.now();
        LocalDateTime shiftStart = LocalDateTime.of(today, shift.getStartTime());
        LocalDateTime shiftEnd = LocalDateTime.of(today, shift.getEndTime());

        if (now.isBefore(shiftStart)) {
            throw new BusinessException(
                    "Your shift has not started. Shift starts at " +
                            shift.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")) +
                            ". Current time: " + now.format(DateTimeFormatter.ofPattern("hh:mm a")));
        }
        if (now.isAfter(shiftEnd)) {
            throw new BusinessException(
                    "Your shift has already ended. Shift ended at " +
                            shift.getEndTime().format(DateTimeFormatter.ofPattern("hh:mm a")) +
                            ". Contact admin if you missed attendance.");
        }

        if (attendanceRepository.existsByTeacherAndAttendanceDate(teacher, today)) {
            throw new BusinessException(
                    "Attendance already marked for today. You're already marked PRESENT.");
        }

        List<Center> assignedCenters = centerRepository.findAllByTeacherId(teacher.getId());
        if (assignedCenters.isEmpty()) {
            throw new BusinessException("You are not assigned to any center. Contact admin.");
        }

        CenterDistance nearest = findNearestCenter(assignedCenters, request);
        if (nearest == null) {
            throw new BusinessException("No active assigned center found. Contact admin.");
        }
        if (!nearest.withinRadius()) {
            throw new LocationValidationException(
                    "You are outside the allowed center area. " +
                            "Nearest center: " + nearest.center().getCenterName() + ". " +
                            "Distance: " + formatMeters(nearest.distanceMeters()) + "m. " +
                            "Allowed radius: " + nearest.center().getRadiusInMeters() + "m. " +
                            "You are " + formatMeters(nearest.distanceOutsideRadius()) +
                            "m away from the allowed radius.");
        }

        int lateByMinutes = (int) Math.max(0, Duration.between(shiftStart, now).toMinutes());
        Attendance attendance = Attendance.builder()
                .teacher(teacher)
                .center(nearest.center())
                .shift(shift)
                .attendanceDate(today)
                .loginTime(now)
                .status(AttendanceStatus.PRESENT)
                .sessionStatus(AttendanceSessionStatus.OPEN)
                .late(lateByMinutes > 0)
                .lateByMinutes(lateByMinutes > 0 ? lateByMinutes : null)
                .checkInWithinRadius(true)
                .checkInDistanceMeters(roundMeters(nearest.distanceMeters()))
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        return toResponse(attendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceResponse markLogout(String teacherEmail, MarkAttendanceRequest request) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new BusinessException("Teacher not found"));

        Attendance attendance = attendanceRepository.findByTeacherAndAttendanceDate(teacher, AppClock.today())
                .orElseThrow(() -> new BusinessException("Mark attendance first before logging out."));

        if (attendance.getStatus() != AttendanceStatus.PRESENT) {
            throw new BusinessException("Logout can only be marked for PRESENT attendance.");
        }
        if (attendance.getLogoutTime() != null ||
                attendance.getSessionStatus() == AttendanceSessionStatus.LOGGED_OUT) {
            throw new BusinessException("Logout already marked for today.");
        }
        if (attendance.getCenter() == null) {
            throw new BusinessException("No center is linked to today's attendance.");
        }
        if (attendance.getShift() == null) {
            throw new BusinessException("No shift is linked to today's attendance.");
        }

        LocalDateTime now = AppClock.now();
        LocalDateTime shiftEnd = LocalDateTime.of(attendance.getAttendanceDate(), attendance.getShift().getEndTime());
        if (now.isBefore(shiftEnd)) {
            throw new BusinessException(
                    "Your shift has not ended yet. Logout can be marked after " +
                            attendance.getShift().getEndTime().format(DateTimeFormatter.ofPattern("hh:mm a")));
        }

        Center center = attendance.getCenter();
        double distance = GeoUtils.calculateDistance(
                request.getLatitude().doubleValue(), request.getLongitude().doubleValue(),
                center.getLatitude().doubleValue(), center.getLongitude().doubleValue());

        attendance.setLogoutTime(now);
        attendance.setLogoutLatitude(request.getLatitude());
        attendance.setLogoutLongitude(request.getLongitude());
        attendance.setLogoutWithinRadius(distance <= center.getRadiusInMeters());
        attendance.setLogoutDistanceMeters(roundMeters(distance));
        attendance.setSessionStatus(AttendanceSessionStatus.LOGGED_OUT);

        return toResponse(attendanceRepository.save(attendance));
    }

    public Page<AttendanceResponse> getMyAttendance(String email, Pageable pageable) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Teacher not found"));
        return attendanceRepository
                .findByTeacherOrderByAttendanceDateDesc(teacher, pageable)
                .map(this::toResponse);
    }

    public Optional<AttendanceResponse> getTodayStatus(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Teacher not found"));
        return attendanceRepository
                .findByTeacherAndAttendanceDate(teacher, AppClock.today())
                .map(this::toResponse);
    }

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

    public TeacherDashboardResponse getTeacherDashboard(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Teacher not found"));

        Optional<Attendance> todayAtt = attendanceRepository
                .findByTeacherAndAttendanceDate(teacher, AppClock.today());

        List<MonthlySummaryResponse> monthlySummary = getMonthlySummary(teacher.getId());

        long totalPresent = monthlySummary.stream()
                .mapToLong(MonthlySummaryResponse::getPresentCount).sum();
        long totalAbsent = monthlySummary.stream()
                .mapToLong(MonthlySummaryResponse::getAbsentCount).sum();

        return TeacherDashboardResponse.builder()
                .teacherName(teacher.getFullName())
                .todayStatus(todayAtt.map(Attendance::getStatus).orElse(null))
                .todaySessionStatus(todayAtt.map(this::resolveSessionStatus).orElse(null))
                .todayLoginTime(todayAtt
                        .map(a -> a.getLoginTime() != null ? a.getLoginTime().toString() : null)
                        .orElse(null))
                .totalPresent(totalPresent)
                .totalAbsent(totalAbsent)
                .recentMonthlySummary(monthlySummary.stream().limit(6).collect(Collectors.toList()))
                .build();
    }

    public DashboardStatsResponse getDashboardStats(
            long totalTeachers, long totalCenters, long totalPrograms) {
        LocalDate today = AppClock.today();
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

    public Page<AttendanceResponse> getAttendanceWithFilters(
            AttendanceFilterRequest filter, Pageable pageable) {
        validateFilter(filter);

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

    @Transactional
    public void markAbsentForMissingTeachers() {
        LocalDate today = AppClock.today();
        LocalDateTime now = AppClock.now();
        List<UUID> presentTeacherIds = attendanceRepository.findTeacherIdsWithAttendanceOnDate(today);

        List<Teacher> allActive = teacherRepository.findAllByActiveTrue();

        List<Attendance> absentRecords = allActive.stream()
                .filter(t -> !presentTeacherIds.contains(t.getId()))
                .filter(t -> t.getShift() != null)
                .filter(t -> Boolean.TRUE.equals(t.getShift().getActive()))
                .filter(t -> LocalDateTime.of(today, t.getShift().getEndTime()).isBefore(now))
                .map(teacher -> Attendance.builder()
                        .teacher(teacher)
                        .shift(teacher.getShift())
                        .center(null)
                        .attendanceDate(today)
                        .loginTime(null)
                        .status(AttendanceStatus.ABSENT)
                        .sessionStatus(AttendanceSessionStatus.NOT_STARTED)
                        .late(false)
                        .build())
                .collect(Collectors.toList());

        if (!absentRecords.isEmpty()) {
            attendanceRepository.saveAll(absentRecords);
            log.info("Marked {} teachers as ABSENT for {}", absentRecords.size(), today);
        }
    }

    @Transactional
    public void markEndedSessionsWithoutLogout() {
        LocalDate today = AppClock.today();
        LocalDateTime now = AppClock.now();
        List<Attendance> ended = attendanceRepository.findOpenSessionsOnOrBefore(today).stream()
                .filter(a -> a.getShift() != null)
                .filter(a -> LocalDateTime.of(a.getAttendanceDate(), a.getShift().getEndTime()).isBefore(now))
                .peek(a -> a.setSessionStatus(AttendanceSessionStatus.ENDED_NO_LOGOUT))
                .toList();

        if (!ended.isEmpty()) {
            attendanceRepository.saveAll(ended);
            log.info("Marked {} attendance sessions as ended without logout", ended.size());
        }
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .teacherId(a.getTeacher().getId())
                .teacherName(a.getTeacher().getFullName())
                .centerId(a.getCenter() != null ? a.getCenter().getId() : null)
                .centerName(a.getCenter() != null ? a.getCenter().getCenterName() : null)
                .centerAddress(a.getCenter() != null ? a.getCenter().getAddress() : null)
                .shiftId(a.getShift() != null ? a.getShift().getId() : null)
                .shiftName(a.getShift() != null ? a.getShift().getShiftName() : null)
                .shiftStartTime(a.getShift() != null ? a.getShift().getStartTime() : null)
                .shiftEndTime(a.getShift() != null ? a.getShift().getEndTime() : null)
                .attendanceDate(a.getAttendanceDate())
                .loginTime(a.getLoginTime())
                .logoutTime(a.getLogoutTime())
                .status(a.getStatus())
                .sessionStatus(resolveSessionStatus(a))
                .late(a.getLate())
                .lateByMinutes(a.getLateByMinutes())
                .checkInWithinRadius(a.getCheckInWithinRadius())
                .checkInDistanceMeters(a.getCheckInDistanceMeters())
                .latitude(a.getLatitude())
                .longitude(a.getLongitude())
                .logoutLatitude(a.getLogoutLatitude())
                .logoutLongitude(a.getLogoutLongitude())
                .logoutWithinRadius(a.getLogoutWithinRadius())
                .logoutDistanceMeters(a.getLogoutDistanceMeters())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private AttendanceSessionStatus resolveSessionStatus(Attendance attendance) {
        if (attendance.getSessionStatus() != null && attendance.getSessionStatus() != AttendanceSessionStatus.OPEN) {
            return attendance.getSessionStatus();
        }
        if (attendance.getLogoutTime() != null) {
            return AttendanceSessionStatus.LOGGED_OUT;
        }
        if (attendance.getStatus() == AttendanceStatus.PRESENT && attendance.getShift() != null) {
            LocalDateTime shiftEnd = LocalDateTime.of(attendance.getAttendanceDate(), attendance.getShift().getEndTime());
            if (AppClock.now().isAfter(shiftEnd)) {
                return AttendanceSessionStatus.ENDED_NO_LOGOUT;
            }
        }
        if (attendance.getStatus() == AttendanceStatus.ABSENT) {
            return AttendanceSessionStatus.NOT_STARTED;
        }
        return attendance.getSessionStatus() != null ? attendance.getSessionStatus() : AttendanceSessionStatus.OPEN;
    }

    private CenterDistance findNearestCenter(List<Center> centers, MarkAttendanceRequest request) {
        CenterDistance nearest = null;
        for (Center center : centers) {
            if (!Boolean.TRUE.equals(center.getActive())) {
                continue;
            }

            double distance = GeoUtils.calculateDistance(
                    request.getLatitude().doubleValue(), request.getLongitude().doubleValue(),
                    center.getLatitude().doubleValue(), center.getLongitude().doubleValue());

            log.debug("Distance to center '{}': {}m (allowed: {}m)",
                    center.getCenterName(), formatMeters(distance), center.getRadiusInMeters());

            if (nearest == null || distance < nearest.distanceMeters()) {
                nearest = new CenterDistance(center, distance);
            }
        }
        return nearest;
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
            Join<Attendance, Shift> shift = root.join("shift", JoinType.LEFT);
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getTeacherId() != null) {
                predicates.add(cb.equal(teacher.get("id"), filter.getTeacherId()));
            }
            if (filter.getCenterId() != null) {
                predicates.add(cb.equal(center.get("id"), filter.getCenterId()));
            }
            if (filter.getShiftId() != null) {
                predicates.add(cb.equal(shift.get("id"), filter.getShiftId()));
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

    private double roundMeters(double meters) {
        return Math.round(meters * 10.0) / 10.0;
    }

    private String formatMeters(double meters) {
        return String.format(Locale.ENGLISH, "%.1f", roundMeters(meters));
    }

    private record CenterDistance(Center center, double distanceMeters) {
        boolean withinRadius() {
            return distanceMeters <= center.getRadiusInMeters();
        }

        double distanceOutsideRadius() {
            return Math.max(0, distanceMeters - center.getRadiusInMeters());
        }
    }
}
