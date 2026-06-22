package org.ngo.attendance.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class UpdateTeacherRequest {

    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String fullName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phoneNumber;

    private Boolean active;

    // Admin can update these, teacher cannot
    private Set<UUID> centerIds;
    private Set<UUID> programIds;
    private UUID shiftId;
}
