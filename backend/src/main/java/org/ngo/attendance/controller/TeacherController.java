package org.ngo.attendance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.UpdateProfileRequest;
import org.ngo.attendance.dto.response.*;
import org.ngo.attendance.service.AttendanceService;
import org.ngo.attendance.service.TeacherService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
@Tag(name = "Teacher", description = "Teacher self-service: profile, history, summary")
@SecurityRequirement(name = "bearerAuth")
public class TeacherController {

    private final TeacherService teacherService;
    private final AttendanceService attendanceService;

    @GetMapping("/profile")
    @Operation(summary = "Get own profile")
    public ResponseEntity<ApiResponse<TeacherResponse>> getProfile(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(teacherService.getTeacherByEmail(userDetails.getUsername()))
        );
    }

    @PatchMapping("/profile")
    @Operation(summary = "Update own name (only field teacher can change)")
    public ResponseEntity<ApiResponse<TeacherResponse>> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                "Profile updated",
                teacherService.updateOwnProfile(userDetails.getUsername(), request)
            )
        );
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Teacher dashboard with today status + monthly summary")
    public ResponseEntity<ApiResponse<TeacherDashboardResponse>> getDashboard(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(attendanceService.getTeacherDashboard(userDetails.getUsername()))
        );
    }

    @GetMapping("/attendance/history")
    @Operation(summary = "Full attendance history paginated")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getHistory(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        var paged = attendanceService.getMyAttendance(
            userDetails.getUsername(), PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(paged)));
    }
}
