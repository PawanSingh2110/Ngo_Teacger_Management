package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.CreateProgramRequest;
import org.ngo.attendance.dto.response.ProgramResponse;
import org.ngo.attendance.entity.Program;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.exception.ResourceNotFoundException;
import org.ngo.attendance.repository.ProgramRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramService {

    private final ProgramRepository programRepository;

    public List<ProgramResponse> getAllPrograms() {
        return programRepository.findAll()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProgramResponse> getActivePrograms() {
        return programRepository.findAllByActiveTrue()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProgramResponse getProgramById(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ProgramResponse createProgram(CreateProgramRequest request) {
        if (programRepository.existsByProgramName(request.getProgramName().trim())) {
            throw new BusinessException("Program name already exists");
        }
        Program program = Program.builder()
            .programName(request.getProgramName().trim())
            .description(request.getDescription())
            .build();
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public ProgramResponse updateProgram(UUID id, CreateProgramRequest request) {
        Program program = findById(id);
        String programName = request.getProgramName().trim();
        if (!program.getProgramName().equalsIgnoreCase(programName)
            && programRepository.existsByProgramName(programName)) {
            throw new BusinessException("Program name already exists");
        }
        program.setProgramName(programName);
        program.setDescription(request.getDescription());
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public void toggleProgramStatus(UUID id) {
        Program program = findById(id);
        program.setActive(!program.getActive());
        programRepository.save(program);
    }

    public Program findById(UUID id) {
        return programRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));
    }

    private ProgramResponse toResponse(Program program) {
        return ProgramResponse.builder()
            .id(program.getId())
            .programName(program.getProgramName())
            .description(program.getDescription())
            .active(program.getActive())
            .createdAt(program.getCreatedAt())
            .updatedAt(program.getUpdatedAt())
            .build();
    }

    @Transactional
    public void deleteProgram(UUID id) {
        if (!programRepository.existsById(id)) {
            throw new ResourceNotFoundException("Program not found with id: " + id);
        }
        programRepository.deleteById(id);
    }
}
