package org.ngo.attendance;

import org.ngo.attendance.util.AppClock;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class AttendanceApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone(AppClock.ZONE));
        SpringApplication.run(AttendanceApplication.class, args);
    }
}
