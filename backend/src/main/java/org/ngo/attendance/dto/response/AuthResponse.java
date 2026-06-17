package org.ngo.attendance.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    @JsonIgnore
    private String accessToken;
    @JsonIgnore
    @Builder.Default
    private String tokenType = "Bearer";
    private String role;
    private String email;
    private String fullName;
    private String userId;
}
