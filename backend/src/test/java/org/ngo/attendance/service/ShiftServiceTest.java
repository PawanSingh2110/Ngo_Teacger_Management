package org.ngo.attendance.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ngo.attendance.dto.response.ShiftResponse;
import org.ngo.attendance.entity.Shift;
import org.ngo.attendance.repository.ShiftRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShiftServiceTest {

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private ShiftService shiftService;

    @Test
    void getAllShifts_shouldKeepTheFirstCreatedShiftAtTheTop() {
        Shift nightShift = Shift.builder()
                .id(UUID.randomUUID())
                .shiftName("Night")
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(22, 0))
                .active(true)
                .createdAt(LocalDateTime.of(2024, 1, 2, 10, 0))
                .build();

        Shift morningShift = Shift.builder()
                .id(UUID.randomUUID())
                .shiftName("Morning")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(12, 0))
                .active(true)
                .createdAt(LocalDateTime.of(2024, 1, 1, 10, 0))
                .build();

        Shift afternoonShift = Shift.builder()
                .id(UUID.randomUUID())
                .shiftName("Afternoon")
                .startTime(LocalTime.of(12, 0))
                .endTime(LocalTime.of(16, 0))
                .active(true)
                .createdAt(LocalDateTime.of(2024, 1, 3, 10, 0))
                .build();

        when(shiftRepository.findAllByOrderByCreatedAtAsc())
                .thenReturn(List.of(nightShift, afternoonShift, morningShift));

        List<ShiftResponse> result = shiftService.getAllShifts();

        assertThat(result)
                .extracting(ShiftResponse::getShiftName)
                .containsExactly("Morning", "Night", "Afternoon");
    }
}
