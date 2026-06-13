package com.chuanphat.warranty.crm.repository;

import com.chuanphat.warranty.crm.entity.CrmAlert;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CrmAlertRepository extends JpaRepository<CrmAlert, Long> {

    /** Lấy alert chưa dismissed của 1 khách hàng cụ thể */
    List<CrmAlert> findByCustomerIdAndDismissedFalseOrderByCreatedAtDesc(Long customerId);

    /** Lấy tất cả alert chưa dismissed (dùng cho dashboard) */
    Page<CrmAlert> findByDismissedFalseOrderBySeverityDescCreatedAtDesc(Pageable pageable);

    /** Lấy alert theo loại, chưa dismissed */
    List<CrmAlert> findByAlertTypeAndDismissedFalse(String alertType);

    /** Kiểm tra xem đã có alert loại này cho customer chưa */
    boolean existsByAlertTypeAndCustomerIdAndDismissedFalse(String alertType, Long customerId);

    /** Kiểm tra alert cho lead */
    boolean existsByAlertTypeAndLeadIdAndDismissedFalse(String alertType, Long leadId);

    /** Xóa alert hết hạn */
    @Modifying
    @Query("DELETE FROM CrmAlert a WHERE a.expiresAt IS NOT NULL AND a.expiresAt < :now")
    int deleteExpired(OffsetDateTime now);

    /** Đếm alert chưa xử lý */
    long countByDismissedFalse();

    /** Đếm alert URGENT chưa xử lý */
    long countBySeverityAndDismissedFalse(String severity);
}
