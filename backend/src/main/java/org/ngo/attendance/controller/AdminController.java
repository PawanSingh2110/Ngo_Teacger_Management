package org.ngo.attendance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.*;
import org.ngo.attendance.dto.response.*;
import org.ngo.attendance.repository.CenterRepository;
import org.ngo.attendance.repository.ProgramRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.ngo.attendance.service.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.format.DateTimeParseException;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only: manage teachers, centers, programs, view reports")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final TeacherService teacherService;
    private final CenterService centerService;
    private final ProgramService programService;
    private final AttendanceService attendanceService;
    private final TeacherRepository teacherRepository;
    private final CenterRepository centerRepository;
    private final ProgramRepository programRepository;
    private final ExcelExportService excelExportService;

    // ==================== DASHBOARD ====================

    @GetMapping("/dashboard")
    @Operation(summary = "Admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        long totalTeachers = teacherRepository.countByActiveTrue();
        long totalCenters = centerRepository.countByActiveTrue();
        long totalPrograms = programRepository.countByActiveTrue();

        DashboardStatsResponse stats = attendanceService.getDashboardStats(
            totalTeachers, totalCenters, totalPrograms
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== TEACHERS ====================

    @GetMapping("/teachers")
    @Operation(summary = "List all teachers with search + filter")
    public ResponseEntity<ApiResponse<PagedResponse<TeacherResponse>>> getTeachers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean active,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
            ApiResponse.success(PagedResponse.from(
                teacherService.getTeachers(search, active, pageable)
            ))
        );
    }

    @GetMapping("/teachers/{id}")
    @Operation(summary = "Get teacher by ID")
    public ResponseEntity<ApiResponse<TeacherResponse>> getTeacher(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getTeacherById(id)));
    }

    @PostMapping("/teachers")
    @Operation(summary = "Create new teacher")
    public ResponseEntity<ApiResponse<TeacherResponse>> createTeacher(
        @Valid @RequestBody CreateTeacherRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Teacher created successfully", teacherService.createTeacher(request))
        );
    }

    @PutMapping("/teachers/{id}")
    @Operation(summary = "Update teacher")
    public ResponseEntity<ApiResponse<TeacherResponse>> updateTeacher(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateTeacherRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Teacher updated", teacherService.updateTeacher(id, request))
        );
    }

    @PatchMapping("/teachers/{id}/toggle-status")
    @Operation(summary = "Toggle teacher active status")
    public ResponseEntity<ApiResponse<Void>> toggleTeacher(@PathVariable UUID id) {
        teacherService.toggleTeacherStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    // ==================== CENTERS ====================

    @GetMapping("/centers")
    public ResponseEntity<ApiResponse<List<CenterResponse>>> getCenters() {
        return ResponseEntity.ok(ApiResponse.success(centerService.getAllCenters()));
    }

    @GetMapping("/centers/{id}")
    public ResponseEntity<ApiResponse<CenterResponse>> getCenter(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(centerService.getCenterById(id)));
    }

    @PostMapping("/centers")
    public ResponseEntity<ApiResponse<CenterResponse>> createCenter(
        @Valid @RequestBody CreateCenterRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Center created", centerService.createCenter(request))
        );
    }

    @PutMapping("/centers/{id}")
    public ResponseEntity<ApiResponse<CenterResponse>> updateCenter(
        @PathVariable UUID id,
        @Valid @RequestBody CreateCenterRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Center updated", centerService.updateCenter(id, request))
        );
    }

    @PatchMapping("/centers/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleCenter(@PathVariable UUID id) {
        centerService.toggleCenterStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    // ==================== PROGRAMS ====================

    @GetMapping("/programs")
    public ResponseEntity<ApiResponse<List<ProgramResponse>>> getPrograms() {
        return ResponseEntity.ok(ApiResponse.success(programService.getAllPrograms()));
    }

    @PostMapping("/programs")
    public ResponseEntity<ApiResponse<ProgramResponse>> createProgram(
        @Valid @RequestBody CreateProgramRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Program created", programService.createProgram(request))
        );
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<ApiResponse<ProgramResponse>> updateProgram(
        @PathVariable UUID id,
        @Valid @RequestBody CreateProgramRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Program updated", programService.updateProgram(id, request))
        );
    }

    @PatchMapping("/programs/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleProgram(@PathVariable UUID id) {
        programService.toggleProgramStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    // ==================== ATTENDANCE REPORTS ====================

    @GetMapping("/attendance")
    @Operation(summary = "View attendance with filters (paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getAttendance(
        @RequestParam(required = false) UUID teacherId,
        @RequestParam(required = false) UUID centerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String fromDate,
        @RequestParam(required = false) String toDate,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        AttendanceFilterRequest filter = buildFilter(
            teacherId, centerId, status, fromDate, toDate, month, year
        );
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
            ApiResponse.success(PagedResponse.from(
                attendanceService.getAttendanceWithFilters(filter, pageable)
            ))
        );
    }

    // ==================== EXCEL EXPORT ====================

    @GetMapping("/export/attendance")
    @Operation(summary = "Export attendance to Excel")
    public ResponseEntity<byte[]> exportAttendance(
        @RequestParam(required = false) UUID teacherId,
        @RequestParam(required = false) UUID centerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String fromDate,
        @RequestParam(required = false) String toDate,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year
    ) {
        AttendanceFilterRequest filter = buildFilter(
            teacherId, centerId, status, fromDate, toDate, month, year
        );
        byte[] excel = excelExportService.exportAttendance(filter);

        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=attendance.xlsx")
            .header("Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            .body(excel);
    }

    private AttendanceFilterRequest buildFilter(
        UUID teacherId, UUID centerId, String status,
        String fromDate, String toDate, Integer month, Integer year
    ) {
        AttendanceFilterRequest filter = new AttendanceFilterRequest();
        filter.setTeacherId(teacherId);
        filter.setCenterId(centerId);
        filter.setMonth(month);
        filter.setYear(year);

        if (status != null && !status.isBlank()) {
            try {
                filter.setStatus(
                    org.ngo.attendance.entity.AttendanceStatus.valueOf(status.toUpperCase())
                );
            } catch (IllegalArgumentException ex) {
                throw new org.ngo.attendance.exception.BusinessException(
                    "Status must be PRESENT or ABSENT"
                );
            }
        }

        try {
            if (fromDate != null && !fromDate.isBlank()) {
                filter.setFromDate(java.time.LocalDate.parse(fromDate));
            }
            if (toDate != null && !toDate.isBlank()) {
                filter.setToDate(java.time.LocalDate.parse(toDate));
            }
        } catch (DateTimeParseException ex) {
            throw new org.ngo.attendance.exception.BusinessException(
                "Dates must use YYYY-MM-DD format"
            );
        }

        return filter;
    }

    @DeleteMapping("/teachers/{id}")
    @Operation(summary = "Delete teacher")
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable UUID id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher deleted successfully", null));
    }

    @DeleteMapping("/centers/{id}")
    @Operation(summary = "Delete center")
    public ResponseEntity<ApiResponse<Void>> deleteCenter(@PathVariable UUID id) {
        centerService.deleteCenter(id);
        return ResponseEntity.ok(ApiResponse.success("Center deleted successfully", null));
    }

    @DeleteMapping("/programs/{id}")
    @Operation(summary = "Delete program")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable UUID id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(ApiResponse.success("Program deleted successfully", null));
    }
}
