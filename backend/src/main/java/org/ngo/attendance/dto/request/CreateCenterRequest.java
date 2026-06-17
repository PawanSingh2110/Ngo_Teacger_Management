package org.ngo.attendance.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateCenterRequest {

    @NotBlank(message = "Center name is required")
    @Size(max = 100)
    private String centerName;

    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private BigDecimal longitude;

    @NotNull(message = "Radius is required")
    @Min(value = 50, message = "Minimum radius is 50 meters")
    @Max(value = 5000, message = "Maximum radius is 5000 meters")
    private Integer radiusInMeters;
}
