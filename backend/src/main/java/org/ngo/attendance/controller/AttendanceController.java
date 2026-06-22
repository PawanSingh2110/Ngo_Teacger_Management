package org.ngo.attendance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.AttendanceFilterRequest;
import org.ngo.attendance.dto.request.MarkAttendanceRequest;
import org.ngo.attendance.dto.response.*;
import org.ngo.attendance.service.AttendanceService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Mark attendance (GPS required) and view records")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {

    private final AttendanceService attendanceService;

    /**
     * TEACHER marks attendance with GPS coordinates.
     * This is SEPARATE from login — teacher must be physically at center.
     */
    @PostMapping("/mark")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Mark Attendance",
        description = "Teacher submits GPS coordinates. Backend validates location against " +
                      "assigned centers using Haversine formula. Returns error if outside radius."
    )
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody MarkAttendanceRequest request
    ) {
        AttendanceResponse response = attendanceService.markAttendance(
            userDetails.getUsername(), request
        );
        return ResponseEntity.ok(
            ApiResponse.success("Attendance marked successfully. You're PRESENT today!", response)
        );
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Mark logout",
        description = "Teacher submits GPS coordinates at logout. Backend records logout time " +
                      "and whether the teacher is still inside the assigned center radius."
    )
    public ResponseEntity<ApiResponse<AttendanceResponse>> markLogout(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody MarkAttendanceRequest request
    ) {
        AttendanceResponse response = attendanceService.markLogout(
            userDetails.getUsername(), request
        );
        return ResponseEntity.ok(
            ApiResponse.success("Logout marked successfully.", response)
        );
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get today's attendance status for logged-in teacher")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayStatus(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Optional<AttendanceResponse> status = attendanceService.getTodayStatus(
            userDetails.getUsername()
        );
        return ResponseEntity.ok(
            ApiResponse.success(status.orElse(null))
        );
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Teacher's own attendance history (paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getMyHistory(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        var paged = attendanceService.getMyAttendance(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(paged)));
    }

    @GetMapping("/my-summary")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Teacher's monthly attendance summary")
    public ResponseEntity<ApiResponse<TeacherDashboardResponse>> getMyDashboard(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(attendanceService.getTeacherDashboard(userDetails.getUsername()))
        );
    }
}
