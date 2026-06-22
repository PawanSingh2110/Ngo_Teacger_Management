package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.ChangePasswordRequest;
import org.ngo.attendance.dto.request.LoginRequest;
import org.ngo.attendance.dto.response.AuthResponse;
import org.ngo.attendance.entity.Admin;
import org.ngo.attendance.entity.Teacher;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.exception.ResourceNotFoundException;
import org.ngo.attendance.repository.AdminRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.ngo.attendance.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

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

    @Transactional
    public void changeAdminPassword(String email, ChangePasswordRequest request) {
        Admin admin = adminRepository.findByEmail(normalizeEmail(email))
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        updatePassword(admin.getPasswordHash(), request, admin::setPasswordHash);
        adminRepository.save(admin);
    }

    @Transactional
    public void changeTeacherPassword(String email, ChangePasswordRequest request) {
        Teacher teacher = teacherRepository.findByEmail(normalizeEmail(email))
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        updatePassword(teacher.getPasswordHash(), request, teacher::setPasswordHash);
        teacherRepository.save(teacher);
    }

    private void updatePassword(
        String currentPasswordHash,
        ChangePasswordRequest request,
        java.util.function.Consumer<String> passwordSetter
    ) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentPasswordHash)) {
            throw new BusinessException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), currentPasswordHash)) {
            throw new BusinessException("New password must be different from current password");
        }
        passwordSetter.accept(passwordEncoder.encode(request.getNewPassword()));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
