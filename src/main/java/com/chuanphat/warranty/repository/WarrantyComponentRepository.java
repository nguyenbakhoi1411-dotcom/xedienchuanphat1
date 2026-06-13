package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.WarrantyComponent;
import com.chuanphat.warranty.enums.ComponentType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarrantyComponentRepository extends JpaRepository<WarrantyComponent, Long> {
    List<WarrantyComponent> findByWarrantyIdOrderByComponentType(Long warrantyId);

    List<WarrantyComponent> findBySerialIdOrderByComponentType(Long serialId);

    Optional<WarrantyComponent> findFirstBySerialIdAndComponentTypeOrderByEndDateDesc(Long serialId, ComponentType componentType);
}
