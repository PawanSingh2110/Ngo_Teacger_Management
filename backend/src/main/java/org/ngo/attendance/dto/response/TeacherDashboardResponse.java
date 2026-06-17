package org.ngo.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ngo.attendance.entity.AttendanceStatus;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardResponse {
    private String teacherName;
    private AttendanceStatus todayStatus;
    private String todayLoginTime;
    private long totalPresent;
    private long totalAbsent;
    private List<MonthlySummaryResponse> recentMonthlySummary;
}
