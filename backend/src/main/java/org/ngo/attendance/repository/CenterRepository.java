package org.ngo.attendance.repository;

import org.ngo.attendance.entity.Center;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CenterRepository extends JpaRepository<Center, UUID> {

    List<Center> findAllByActiveTrue();

    boolean existsByCenterName(String centerName);

    long countByActiveTrue();

    @Query("""
        SELECT c FROM Center c
        JOIN c.teachers t
        WHERE t.id = :teacherId
        AND c.active = true
    """)
    List<Center> findAllByTeacherId(@Param("teacherId") UUID teacherId);
}
