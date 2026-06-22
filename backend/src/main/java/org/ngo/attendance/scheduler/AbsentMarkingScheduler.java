package org.ngo.attendance.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ngo.attendance.service.AttendanceService;
import org.ngo.attendance.util.AppClock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AbsentMarkingScheduler {

    private final AttendanceService attendanceService;

    /**
     * Runs every minute.
     * For every active teacher without attendance today → mark ABSENT.
     * Closed shifts are finalized and missing attendance is marked absent.
     */
    @Scheduled(cron = "${app.scheduler.absent-marking-cron}", zone = "${app.time-zone}")
    public void markAbsentTeachers() {
        log.info("=== Absent Marking Scheduler started at {} ===", AppClock.now());
        try {
            attendanceService.markEndedSessionsWithoutLogout();
            attendanceService.markAbsentForMissingTeachers();
            log.info("=== Absent Marking Scheduler completed for date: {} ===", AppClock.today());
        } catch (Exception e) {
            log.error("Error in Absent Marking Scheduler: {}", e.getMessage(), e);
        }
    }
}
