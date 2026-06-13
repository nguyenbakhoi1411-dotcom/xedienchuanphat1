package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.Attendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(Long employeeId, LocalDate from, LocalDate to);
    List<Attendance> findByWorkDateBetweenOrderByWorkDateDesc(LocalDate from, LocalDate to);
    Optional<Attendance> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
}
