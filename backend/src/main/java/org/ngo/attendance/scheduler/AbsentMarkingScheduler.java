package org.ngo.attendance.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ngo.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AbsentMarkingScheduler {

    private final AttendanceService attendanceService;

    /**
     * Runs daily at 11 PM.
     * For every active teacher without attendance today → mark ABSENT.
     * Cron: second minute hour day month weekday
     */
    @Scheduled(cron = "${app.scheduler.absent-marking-cron}")
    public void markAbsentTeachers() {
        log.info("=== Absent Marking Scheduler started at {} ===", LocalDateTime.now());
        try {
            attendanceService.markAbsentForMissingTeachers();
            log.info("=== Absent Marking Scheduler completed for date: {} ===", LocalDate.now());
        } catch (Exception e) {
            log.error("Error in Absent Marking Scheduler: {}", e.getMessage(), e);
        }
    }
}
