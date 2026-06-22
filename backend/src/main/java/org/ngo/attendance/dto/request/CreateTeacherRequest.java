package org.ngo.attendance.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class CreateTeacherRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private Set<UUID> centerIds;

    private Set<UUID> programIds;

    private UUID shiftId;
}
