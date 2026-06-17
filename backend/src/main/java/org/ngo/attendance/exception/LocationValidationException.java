package org.ngo.attendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class LocationValidationException extends RuntimeException {
    public LocationValidationException(String message) {
        super(message);
    }
}
