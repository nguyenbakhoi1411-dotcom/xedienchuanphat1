package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.Position;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByActiveTrueOrderByName();
}
