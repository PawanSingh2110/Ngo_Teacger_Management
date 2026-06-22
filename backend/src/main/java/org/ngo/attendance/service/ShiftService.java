package org.ngo.attendance.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.dto.request.ShiftRequest;
import org.ngo.attendance.dto.response.ShiftResponse;
import org.ngo.attendance.entity.Shift;
import org.ngo.attendance.exception.BusinessException;
import org.ngo.attendance.exception.ResourceNotFoundException;
import org.ngo.attendance.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAllByOrderByStartTimeAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public ShiftResponse getShift(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ShiftResponse createShift(ShiftRequest request) {
        validateTimes(request);
        String name = request.getShiftName().trim();
        if (shiftRepository.existsByShiftNameIgnoreCase(name)) {
            throw new BusinessException("Shift already exists: " + name);
        }

        Shift shift = Shift.builder()
                .shiftName(name)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .active(request.getActive() == null || request.getActive())
                .build();
        return toResponse(shiftRepository.save(shift));
    }

    @Transactional
    public ShiftResponse updateShift(UUID id, ShiftRequest request) {
        validateTimes(request);
        Shift shift = findById(id);
        shift.setShiftName(request.getShiftName().trim());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        if (request.getActive() != null) {
            shift.setActive(request.getActive());
        }
        return toResponse(shiftRepository.save(shift));
    }

    @Transactional
    public void deleteShift(UUID id) {
        if (!shiftRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shift not found: " + id);
        }
        shiftRepository.deleteById(id);
    }

    public Shift findById(UUID id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found: " + id));
    }

    private void validateTimes(ShiftRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            return;
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessException("Shift start time must be before end time");
        }
    }

    private ShiftResponse toResponse(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .shiftName(shift.getShiftName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .active(shift.getActive())
                .build();
    }
}
