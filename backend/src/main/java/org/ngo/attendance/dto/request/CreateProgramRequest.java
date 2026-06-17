package org.ngo.attendance.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProgramRequest {

    @NotBlank(message = "Program name is required")
    @Size(max = 100)
    private String programName;

    private String description;
}
