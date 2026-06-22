package org.ngo.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "attendance",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_teacher_attendance_date",
            columnNames = {"teacher_id", "attendance_date"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    private Center center;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "login_time")
    private LocalDateTime loginTime;

    @Column(name = "logout_time")
    private LocalDateTime logoutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private AttendanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_status", length = 20)
    @Builder.Default
    private AttendanceSessionStatus sessionStatus = AttendanceSessionStatus.OPEN;

    @Column(name = "late")
    @Builder.Default
    private Boolean late = false;

    @Column(name = "late_by_minutes")
    private Integer lateByMinutes;

    @Column(name = "check_in_within_radius")
    private Boolean checkInWithinRadius;

    @Column(name = "check_in_distance_meters")
    private Double checkInDistanceMeters;

    @Column(name = "logout_distance_meters")
    private Double logoutDistanceMeters;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "logout_latitude", precision = 10, scale = 8)
    private BigDecimal logoutLatitude;

    @Column(name = "logout_longitude", precision = 11, scale = 8)
    private BigDecimal logoutLongitude;

    @Column(name = "logout_within_radius")
    private Boolean logoutWithinRadius;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
