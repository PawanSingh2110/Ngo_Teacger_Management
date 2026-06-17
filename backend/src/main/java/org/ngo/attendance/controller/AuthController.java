package org.ngo.attendance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.LoginRequest;
import org.ngo.attendance.dto.response.ApiResponse;
import org.ngo.attendance.dto.response.AuthResponse;
import org.ngo.attendance.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login endpoint — returns JWT only, no attendance marking")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
        summary = "Login",
        description = "Validates credentials and returns JWT. Does NOT mark attendance. " +
                      "Teachers can login from anywhere. Attendance is a separate API call."
    )
    public ResponseEntity<ApiResponse<AuthResponse>> login(
        @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
