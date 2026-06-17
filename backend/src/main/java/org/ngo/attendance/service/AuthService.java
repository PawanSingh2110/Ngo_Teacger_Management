package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.LoginRequest;
import org.ngo.attendance.dto.response.AuthResponse;
import org.ngo.attendance.entity.Admin;
import org.ngo.attendance.entity.Teacher;
import org.ngo.attendance.repository.AdminRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.ngo.attendance.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;

    /**
     * LOGIN only validates credentials and returns a JWT.
     * Attendance is NOT marked here — it's a separate API call.
     * This allows teachers to login from anywhere to view history/profile.
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate credentials
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        // Check if Admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), "SUPER_ADMIN");
            return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .role("SUPER_ADMIN")
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .userId(admin.getId().toString())
                .build();
        }

        // Otherwise Teacher
        Teacher teacher = teacherRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(teacher.getId(), teacher.getEmail(), "TEACHER");
        return AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .role("TEACHER")
            .email(teacher.getEmail())
            .fullName(teacher.getFullName())
            .userId(teacher.getId().toString())
            .build();
    }
}
