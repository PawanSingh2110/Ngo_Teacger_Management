package org.ngo.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CenterResponse {
    private UUID id;
    private String centerName;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer radiusInMeters;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
