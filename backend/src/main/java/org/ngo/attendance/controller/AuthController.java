package org.ngo.attendance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.LoginRequest;
import org.ngo.attendance.dto.response.ApiResponse;
import org.ngo.attendance.dto.response.AuthResponse;
import org.ngo.attendance.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login endpoint - sets secure auth cookie, no attendance marking")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @PostMapping("/login")
    @Operation(
        summary = "Login",
        description = "Validates credentials and sets an HttpOnly JWT cookie. Does NOT mark attendance. " +
                      "Teachers can login from anywhere. Attendance is a separate API call."
    )
    public ResponseEntity<ApiResponse<AuthResponse>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest servletRequest
    ) {
        AuthResponse response = authService.login(request);
        ResponseCookie cookie = authCookie(
            response.getAccessToken(),
            Duration.ofMillis(accessTokenExpiryMs),
            isSecureRequest(servletRequest)
        );

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Clears the HttpOnly auth cookie.")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest servletRequest) {
        ResponseCookie cookie = authCookie("", Duration.ZERO, isSecureRequest(servletRequest));

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(ApiResponse.success("Logged out", null));
    }

    private ResponseCookie authCookie(String value, Duration maxAge, boolean secure) {
        return ResponseCookie.from("ngo_token", value)
            .httpOnly(true)
            .secure(secure)
            .sameSite(secure ? "None" : "Lax")
            .path("/")
            .maxAge(maxAge)
            .build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        return request.isSecure() || "https".equalsIgnoreCase(forwardedProto);
    }
}
