package org.ngo.attendance.dto.request;

import lombok.Data;
import org.ngo.attendance.entity.AttendanceStatus;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AttendanceFilterRequest {
    private UUID teacherId;
    private UUID centerId;
    private UUID programId;
    private AttendanceStatus status;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer month;
    private Integer year;
}
