package org.ngo.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftResponse {
    private UUID id;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean active;
}
