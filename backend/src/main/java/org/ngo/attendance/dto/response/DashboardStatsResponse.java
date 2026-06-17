package org.ngo.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalTeachers;
    private long totalCenters;
    private long totalPrograms;
    private long presentToday;
    private long absentToday;
    private List<AttendanceResponse> todayAttendanceOverview;
}
