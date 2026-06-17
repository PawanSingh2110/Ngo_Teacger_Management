package org.ngo.attendance.security.service;

import lombok.RequiredArgsConstructor;
import org.ngo.attendance.entity.Admin;
import org.ngo.attendance.entity.Teacher;
import org.ngo.attendance.repository.AdminRepository;
import org.ngo.attendance.repository.TeacherRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try admin first
        var adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return User.builder()
                .username(admin.getEmail())
                .password(admin.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")))
                .accountExpired(false)
                .accountLocked(!admin.getActive())
                .credentialsExpired(false)
                .disabled(!admin.getActive())
                .build();
        }

        // Try teacher
        var teacherOpt = teacherRepository.findByEmail(email);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            return User.builder()
                .username(teacher.getEmail())
                .password(teacher.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_TEACHER")))
                .accountExpired(false)
                .accountLocked(!teacher.getActive())
                .credentialsExpired(false)
                .disabled(!teacher.getActive())
                .build();
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
