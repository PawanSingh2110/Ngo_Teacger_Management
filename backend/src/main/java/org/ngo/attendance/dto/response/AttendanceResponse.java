package org.ngo.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ngo.attendance.entity.AttendanceStatus;
import org.ngo.attendance.entity.AttendanceSessionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private UUID id;
    private UUID teacherId;
    private String teacherName;
    private UUID centerId;
    private String centerName;
    private String centerAddress;
    private UUID shiftId;
    private String shiftName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private LocalDate attendanceDate;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private AttendanceStatus status;
    private AttendanceSessionStatus sessionStatus;
    private Boolean late;
    private Integer lateByMinutes;
    private Boolean checkInWithinRadius;
    private Double checkInDistanceMeters;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal logoutLatitude;
    private BigDecimal logoutLongitude;
    private Boolean logoutWithinRadius;
    private Double logoutDistanceMeters;
    private LocalDateTime createdAt;
}
