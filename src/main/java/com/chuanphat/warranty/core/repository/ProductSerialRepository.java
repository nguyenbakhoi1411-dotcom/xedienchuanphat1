package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.enums.SerialStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface ProductSerialRepository extends JpaRepository<ProductSerial, Long> {

    boolean existsBySerialNumberIgnoreCase(String serialNumber);

    Optional<ProductSerial> findBySerialNumberIgnoreCase(String serialNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ProductSerial s where s.id = :id")
    Optional<ProductSerial> findWithLockById(Long id);

    Page<ProductSerial> findByBranchIdAndStatus(Long branchId, SerialStatus status, Pageable pageable);

    Page<ProductSerial> findByBranchId(Long branchId, Pageable pageable);

    Page<ProductSerial> findByWarehouse_Id(Long warehouseId, Pageable pageable);

    Page<ProductSerial> findByWarehouse_IdAndStatus(Long warehouseId, SerialStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ProductSerial s where lower(s.serialNumber) = lower(:serialNumber)")
    Optional<ProductSerial> findWithLockBySerialNumberIgnoreCase(String serialNumber);

    List<ProductSerial> findByStatusAndReservationUntilBefore(SerialStatus status, OffsetDateTime reservationUntil);

    // ── Search nang cao ──

    /**
     * Tim serial theo so khung (frameNumber).
     */
    Optional<ProductSerial> findByFrameNumberIgnoreCase(String frameNumber);

    /**
     * Tim serial theo so pin (batterySerial).
     */
    Optional<ProductSerial> findByBatterySerialIgnoreCase(String batterySerial);

    /**
     * Tim serial theo so may (engineNumber).
     */
    Optional<ProductSerial> findByEngineNumberIgnoreCase(String engineNumber);

    /**
     * Full-text search: tim tat ca serial co serialNumber, frameNumber, engineNumber
     * hoac batterySerial chua keyword (case insensitive). Ho tro phan trang.
     */
    @Query("""
            select s from ProductSerial s
            where (:keyword is null or :keyword = ''
                   or lower(s.serialNumber) like lower(concat('%', :keyword, '%'))
                   or lower(s.frameNumber)  like lower(concat('%', :keyword, '%'))
                   or lower(s.engineNumber) like lower(concat('%', :keyword, '%'))
                   or lower(s.batterySerial) like lower(concat('%', :keyword, '%'))
            )
            and (:branchId is null or s.branchId = :branchId)
            and (:warehouseId is null or s.warehouse.id = :warehouseId)
            and (:productId is null or s.product.id = :productId)
            and (:status is null or s.status = :status)
            order by s.createdAt desc
            """)
    Page<ProductSerial> search(
            @Param("keyword") String keyword,
            @Param("branchId") Long branchId,
            @Param("warehouseId") Long warehouseId,
            @Param("productId") Long productId,
            @Param("status") SerialStatus status,
            Pageable pageable
    );

    /**
     * Filter serial theo branchId va nhieu status cung luc.
     */
    @Query("select s from ProductSerial s where s.branchId = :branchId and s.status in :statuses")
    Page<ProductSerial> findByBranchIdAndStatusIn(
            @Param("branchId") Long branchId,
            @Param("statuses") List<SerialStatus> statuses,
            Pageable pageable
    );

    /**
     * Dem so serial theo product va status (hien thi so ton trong product list).
     */
    @Query("select count(s) from ProductSerial s where s.product.id = :productId and s.status = :status")
    long countByProductIdAndStatus(@Param("productId") Long productId, @Param("status") SerialStatus status);

    /**
     * Lay danh sach serial da ban cho mot khach hang cu the.
     */
    List<ProductSerial> findByCurrentCustomerIdOrderBySoldDateDesc(Long customerId);

    /**
     * Tim serial theo productId va status (de POS chon serial khi ban hang).
     */
    Page<ProductSerial> findByProduct_IdAndStatus(Long productId, SerialStatus status, Pageable pageable);

    boolean existsByFrameNumberIgnoreCase(String frameNumber);
    boolean existsByBatterySerialIgnoreCase(String batterySerial);
    boolean existsByEngineNumberIgnoreCase(String engineNumber);
}
