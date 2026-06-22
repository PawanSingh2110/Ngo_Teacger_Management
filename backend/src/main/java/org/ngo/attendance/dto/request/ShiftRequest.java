package org.ngo.attendance.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ShiftRequest {

    @NotBlank(message = "Shift name is required")
    @Size(max = 100, message = "Shift name must be 100 characters or less")
    private String shiftName;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Boolean active;
}
