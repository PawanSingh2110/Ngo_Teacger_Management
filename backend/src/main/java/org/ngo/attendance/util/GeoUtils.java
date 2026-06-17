package org.ngo.attendance.util;

import java.math.BigDecimal;

public class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;

    private GeoUtils() {}

    /**
     * Haversine formula - calculates distance between two GPS coordinates in meters.
     */
    public static double calculateDistance(
        double lat1, double lon1,
        double lat2, double lon2
    ) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1))
            * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }

    public static double calculateDistance(BigDecimal lat1, BigDecimal lon1,
                                           BigDecimal lat2, BigDecimal lon2) {
        return calculateDistance(
            lat1.doubleValue(), lon1.doubleValue(),
            lat2.doubleValue(), lon2.doubleValue()
        );
    }

    public static boolean isWithinRadius(
        BigDecimal teacherLat, BigDecimal teacherLon,
        BigDecimal centerLat, BigDecimal centerLon,
        int radiusInMeters
    ) {
        double distance = calculateDistance(teacherLat, teacherLon, centerLat, centerLon);
        return distance <= radiusInMeters;
    }
}
