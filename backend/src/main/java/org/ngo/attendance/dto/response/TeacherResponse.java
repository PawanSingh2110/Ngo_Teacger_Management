package org.ngo.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Boolean active;
    private ShiftSummary shift;
    private Set<CenterSummary> centers;
    private Set<ProgramSummary> programs;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CenterSummary {
        private UUID id;
        private String centerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramSummary {
        private UUID id;
        private String programName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShiftSummary {
        private UUID id;
        private String shiftName;
        private LocalTime startTime;
        private LocalTime endTime;
    }
}
