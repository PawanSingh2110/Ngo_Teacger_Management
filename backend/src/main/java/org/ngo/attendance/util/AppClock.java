package org.ngo.attendance.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class AppClock {
    public static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private AppClock() {
    }

    public static LocalDate today() {
        return LocalDate.now(ZONE);
    }

    public static LocalDateTime now() {
        return LocalDateTime.now(ZONE);
    }
}
