package org.ngo.attendance.repository;

import org.ngo.attendance.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, UUID> {
    boolean existsByShiftNameIgnoreCase(String shiftName);

    List<Shift> findAllByOrderByStartTimeAsc();
}
