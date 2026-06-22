package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.CreateTeacherRequest;
import org.ngo.attendance.dto.request.UpdateProfileRequest;
import org.ngo.attendance.dto.request.UpdateTeacherRequest;
import org.ngo.attendance.dto.response.TeacherResponse;
import org.ngo.attendance.entity.Center;
import org.ngo.attendance.entity.Program;
import org.ngo.attendance.entity.Teacher;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.exception.ResourceNotFoundException;
import org.ngo.attendance.repository.CenterRepository;
import org.ngo.attendance.repository.ProgramRepository;
import org.ngo.attendance.repository.ShiftRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final CenterRepository centerRepository;
    private final ProgramRepository programRepository;
    private final ShiftRepository shiftRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<TeacherResponse> getTeachers(String search, Boolean active, Pageable pageable) {
        Page<Teacher> teacherPage = teacherRepository.searchTeachers(normalizeSearch(search), active, pageable);
        if (teacherPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<UUID> teacherIds = teacherPage.getContent().stream()
            .map(Teacher::getId)
            .toList();
        Map<UUID, Teacher> teachersById = teacherRepository.findAllByIdWithDetails(teacherIds).stream()
            .collect(Collectors.toMap(Teacher::getId, Function.identity()));

        List<TeacherResponse> content = teacherIds.stream()
            .map(teachersById::get)
            .map(this::toResponse)
            .toList();

        return new PageImpl<>(content, pageable, teacherPage.getTotalElements());
    }

    public TeacherResponse getTeacherById(UUID id) {
        return toResponse(findByIdWithDetails(id));
    }

    public TeacherResponse getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + email));
        return toResponse(teacher);
    }

    @Transactional
    public TeacherResponse createTeacher(CreateTeacherRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (teacherRepository.existsByEmail(email)) {
            throw new BusinessException("Email already registered: " + email);
        }

        Teacher teacher = Teacher.builder()
            .fullName(request.getFullName().trim())
            .email(email)
            .phoneNumber(request.getPhoneNumber())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .build();

        assignCenters(teacher, request.getCenterIds());
        assignPrograms(teacher, request.getProgramIds());
        assignShift(teacher, request.getShiftId());

        return toResponse(teacherRepository.save(teacher));
    }

    // Admin updates all fields
    @Transactional
    public TeacherResponse updateTeacher(UUID id, UpdateTeacherRequest request) {
        Teacher teacher = findByIdWithDetails(id);

        if (request.getFullName() != null) teacher.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) teacher.setPhoneNumber(request.getPhoneNumber());
        if (request.getActive() != null) teacher.setActive(request.getActive());
        if (request.getCenterIds() != null) assignCenters(teacher, request.getCenterIds());
        if (request.getProgramIds() != null) assignPrograms(teacher, request.getProgramIds());
        if (request.getShiftId() != null) assignShift(teacher, request.getShiftId());

        return toResponse(teacherRepository.save(teacher));
    }

    // Teacher updates only their own name
    @Transactional
    public TeacherResponse updateOwnProfile(String email, UpdateProfileRequest request) {
        Teacher teacher = teacherRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setFullName(request.getFullName());
        return toResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public void toggleTeacherStatus(UUID id) {
        Teacher teacher = findById(id);
        teacher.setActive(!teacher.getActive());
        teacherRepository.save(teacher);
    }

    @Transactional
    public void resetTeacherPassword(UUID id, String newPassword) {
        Teacher teacher = findById(id);
        teacher.setPasswordHash(passwordEncoder.encode(newPassword));
        teacherRepository.save(teacher);
    }

    public Teacher findById(UUID id) {
        return teacherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + id));
    }

    public Teacher findByIdWithDetails(UUID id) {
        return teacherRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + id));
    }

    public Teacher findByEmail(String email) {
        return teacherRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + email));
    }

    private void assignCenters(Teacher teacher, Set<UUID> centerIds) {
        if (centerIds == null || centerIds.isEmpty()) {
            teacher.setCenters(new HashSet<>());
            return;
        }
        Set<Center> centers = new HashSet<>(centerRepository.findAllById(centerIds));
        if (centers.size() != centerIds.size()) {
            throw new BusinessException("One or more selected centers do not exist");
        }
        teacher.setCenters(centers);
    }

    private void assignPrograms(Teacher teacher, Set<UUID> programIds) {
        if (programIds == null || programIds.isEmpty()) {
            teacher.setPrograms(new HashSet<>());
            return;
        }
        Set<Program> programs = new HashSet<>(programRepository.findAllById(programIds));
        if (programs.size() != programIds.size()) {
            throw new BusinessException("One or more selected programs do not exist");
        }
        teacher.setPrograms(programs);
    }

    private void assignShift(Teacher teacher, UUID shiftId) {
        if (shiftId == null) {
            teacher.setShift(null);
            return;
        }
        teacher.setShift(shiftRepository.findById(shiftId)
            .orElseThrow(() -> new BusinessException("Selected shift does not exist")));
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return "";
        }
        return search.trim();
    }

    private TeacherResponse toResponse(Teacher teacher) {
        Set<TeacherResponse.CenterSummary> centers = teacher.getCenters() == null
            ? new HashSet<>()
            : teacher.getCenters().stream()
                .map(c -> TeacherResponse.CenterSummary.builder()
                    .id(c.getId()).centerName(c.getCenterName()).build())
                .collect(Collectors.toSet());

        Set<TeacherResponse.ProgramSummary> programs = teacher.getPrograms() == null
            ? new HashSet<>()
            : teacher.getPrograms().stream()
                .map(p -> TeacherResponse.ProgramSummary.builder()
                    .id(p.getId()).programName(p.getProgramName()).build())
                .collect(Collectors.toSet());

        TeacherResponse.ShiftSummary shift = teacher.getShift() == null
            ? null
            : TeacherResponse.ShiftSummary.builder()
                .id(teacher.getShift().getId())
                .shiftName(teacher.getShift().getShiftName())
                .startTime(teacher.getShift().getStartTime())
                .endTime(teacher.getShift().getEndTime())
                .build();

        return TeacherResponse.builder()
            .id(teacher.getId())
            .fullName(teacher.getFullName())
            .email(teacher.getEmail())
            .phoneNumber(teacher.getPhoneNumber())
            .active(teacher.getActive())
            .shift(shift)
            .centers(centers)
            .programs(programs)
            .createdAt(teacher.getCreatedAt())
            .build();
    }

    @Transactional
    public void deleteTeacher(UUID id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found: " + id);
        }
        teacherRepository.deleteById(id);
    }
}
