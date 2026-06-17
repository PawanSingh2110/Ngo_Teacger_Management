package org.ngo.attendance.repository;

import org.ngo.attendance.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {

    Optional<Teacher> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Teacher> findAllByActiveTrue();

    @Query("""
        SELECT DISTINCT t FROM Teacher t
        LEFT JOIN FETCH t.centers
        LEFT JOIN FETCH t.programs
        WHERE t.id = :id
    """)
    Optional<Teacher> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
        SELECT DISTINCT t FROM Teacher t
        LEFT JOIN FETCH t.centers
        LEFT JOIN FETCH t.programs
        WHERE t.id IN :ids
    """)
    List<Teacher> findAllByIdWithDetails(@Param("ids") List<UUID> ids);

    @Query("""
        SELECT t FROM Teacher t
        WHERE (LOWER(t.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR t.phoneNumber LIKE CONCAT('%', :search, '%'))
        AND (:active IS NULL OR t.active = :active)
    """)
    Page<Teacher> searchTeachers(
        @Param("search") String search,
        @Param("active") Boolean active,
        Pageable pageable
    );

    @Query("""
        SELECT t FROM Teacher t
        JOIN t.centers c
        WHERE c.id = :centerId
        AND t.active = true
    """)
    List<Teacher> findAllByCenterId(@Param("centerId") UUID centerId);

    @Query("""
        SELECT t FROM Teacher t
        JOIN t.programs p
        WHERE p.id = :programId
        AND t.active = true
    """)
    List<Teacher> findAllByProgramId(@Param("programId") UUID programId);

    long countByActiveTrue();
}
