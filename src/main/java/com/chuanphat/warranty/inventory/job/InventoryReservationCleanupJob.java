package com.chuanphat.warranty.inventory.job;

import com.chuanphat.warranty.core.entity.InventoryReservation;
import com.chuanphat.warranty.core.enums.InventoryReservationStatus;
import com.chuanphat.warranty.core.repository.InventoryReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class InventoryReservationCleanupJob {
    private static final Logger log = LoggerFactory.getLogger(InventoryReservationCleanupJob.class);
    
    private final InventoryReservationRepository reservationRepository;

    public InventoryReservationCleanupJob(InventoryReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // Chạy mỗi giờ (0 phút, mọi giờ)
    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void cleanupExpiredReservations() {
        log.info("Bắt đầu Job giải phóng tồn kho bị treo (Reservation Cleanup)...");
        OffsetDateTime now = OffsetDateTime.now();
        
        List<InventoryReservation> expiredList = reservationRepository.findByStatusAndExpiresAtBefore(
                InventoryReservationStatus.ACTIVE, now);

        if (expiredList.isEmpty()) {
            log.info("Không có phiếu giữ chỗ nào quá hạn.");
            return;
        }

        for (InventoryReservation res : expiredList) {
            log.warn("Giải phóng tồn kho giữ chỗ: {} - Sản phẩm: {}, Số lượng: {}", 
                     res.getReservationNo(), res.getProduct().getProductName(), res.getQuantity());
                     
            res.setStatus(InventoryReservationStatus.EXPIRED);
            // Trong hệ thống thực tế, ta có thể lưu AuditLog ở đây với lý do: 
            // "Tự động giải phóng do quá hạn giữ chỗ 24h"
        }

        reservationRepository.saveAll(expiredList);
        log.info("Đã giải phóng thành công {} phiếu giữ chỗ.", expiredList.size());
    }
}
