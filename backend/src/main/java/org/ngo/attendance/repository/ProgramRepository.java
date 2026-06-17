package org.ngo.attendance.repository;

import org.ngo.attendance.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {

    List<Program> findAllByActiveTrue();

    boolean existsByProgramName(String programName);

    long countByActiveTrue();
}
