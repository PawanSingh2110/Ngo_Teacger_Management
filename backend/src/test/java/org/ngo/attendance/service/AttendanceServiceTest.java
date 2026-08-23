package org.ngo.attendance.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ngo.attendance.dto.request.MarkAttendanceRequest;
import org.ngo.attendance.dto.response.AttendanceResponse;
import org.ngo.attendance.entity.*;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.repository.AttendanceRepository;
import org.ngo.attendance.repository.CenterRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.ngo.attendance.util.AppClock;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private CenterRepository centerRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    @Test
    void markAttendance_shouldAllowCheckInUpTo20MinutesBeforeShiftStarts() {
        Teacher teacher = createTeacher();
        Center center = createCenter();
        MarkAttendanceRequest request = createRequest(0, 0);

        try (MockedStatic<AppClock> mockedClock = mockStatic(AppClock.class)) {
            mockedClock.when(AppClock::today).thenReturn(LocalDate.of(2026, 8, 23));
            mockedClock.when(AppClock::now).thenReturn(LocalDateTime.of(2026, 8, 23, 8, 40));

            when(teacherRepository.findByEmail("teacher@example.com")).thenReturn(java.util.Optional.of(teacher));
            when(attendanceRepository.existsByTeacherAndAttendanceDate(teacher, LocalDate.of(2026, 8, 23))).thenReturn(false);
            when(centerRepository.findAllByTeacherId(teacher.getId())).thenReturn(List.of(center));
            when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

            AttendanceResponse response = attendanceService.markAttendance("teacher@example.com", request);

            assertThat(response).isNotNull();
            assertThat(response.getTeacherName()).isEqualTo("Test Teacher");
            assertThat(response.getStatus()).isEqualTo(AttendanceStatus.PRESENT);
        }
    }

    @Test
    void markAttendance_shouldRejectCheckInMoreThan20MinutesBeforeShiftStarts() {
        Teacher teacher = createTeacher();
        Center center = createCenter();
        MarkAttendanceRequest request = createRequest(0, 0);

        try (MockedStatic<AppClock> mockedClock = mockStatic(AppClock.class)) {
            mockedClock.when(AppClock::today).thenReturn(LocalDate.of(2026, 8, 23));
            mockedClock.when(AppClock::now).thenReturn(LocalDateTime.of(2026, 8, 30));

            when(teacherRepository.findByEmail("teacher@example.com")).thenReturn(java.util.Optional.of(teacher));
            when(attendanceRepository.existsByTeacherAndAttendanceDate(teacher, LocalDate.of(2026, 8, 23))).thenReturn(false);
            when(centerRepository.findAllByTeacherId(teacher.getId())).thenReturn(List.of(center));

            assertThatThrownBy(() -> attendanceService.markAttendance("teacher@example.com", request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("before 20 minutes");
        }
    }

    private Teacher createTeacher() {
        Shift shift = Shift.builder()
                .id(java.util.UUID.randomUUID())
                .shiftName("Morning")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .active(true)
                .build();

        Teacher teacher = new Teacher();
        teacher.setId(java.util.UUID.randomUUID());
        teacher.setFullName("Test Teacher");
        teacher.setEmail("teacher@example.com");
        teacher.setPasswordHash("hash");
        teacher.setActive(true);
        teacher.setShift(shift);
        return teacher;
    }

    private Center createCenter() {
        Center center = new Center();
        center.setId(java.util.UUID.randomUUID());
        center.setCenterName("Main Center");
        center.setLatitude(BigDecimal.ZERO);
        center.setLongitude(BigDecimal.ZERO);
        center.setRadiusInMeters(100);
        center.setActive(true);
        return center;
    }

    private MarkAttendanceRequest createRequest(double latitude, double longitude) {
        MarkAttendanceRequest request = new MarkAttendanceRequest();
        request.setLatitude(BigDecimal.valueOf(latitude));
        request.setLongitude(BigDecimal.valueOf(longitude));
        return request;
    }
}
