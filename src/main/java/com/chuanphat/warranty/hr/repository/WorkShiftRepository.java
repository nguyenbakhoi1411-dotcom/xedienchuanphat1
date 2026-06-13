package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.WorkShift;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {
    List<WorkShift> findByActiveTrueOrderByStartTime();
}
