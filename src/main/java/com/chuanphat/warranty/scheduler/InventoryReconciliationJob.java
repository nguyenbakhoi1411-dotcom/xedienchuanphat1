package com.chuanphat.warranty.scheduler;

import com.chuanphat.warranty.core.entity.InventoryCount;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import com.chuanphat.warranty.core.repository.InventoryCountRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class InventoryReconciliationJob {

    private static final Logger log = LoggerFactory.getLogger(InventoryReconciliationJob.class);

    private final InventoryCountRepository countRepository;
    private final InventoryStockRepository stockRepository;

    public InventoryReconciliationJob(InventoryCountRepository countRepository, InventoryStockRepository stockRepository) {
        this.countRepository = countRepository;
        this.stockRepository = stockRepository;
    }

    /**
     * Chạy định kỳ vào 23:00 mỗi ngày để đối chiếu tồn kho sổ sách với biên bản kiểm kê gần nhất.
     */
    @Scheduled(cron = "0 0 23 * * ?")
    @Transactional(readOnly = true)
    public void reconcileInventoryDaily() {
        log.info("Bắt đầu đối chiếu tồn kho định kỳ: {}", OffsetDateTime.now());
        
        // Giả sử lấy tất cả các phiếu kiểm kê đã hoàn thành trong 24h qua
        OffsetDateTime yesterday = OffsetDateTime.now().minusDays(1);
        List<InventoryCount> recentCounts = countRepository.findByStatusAndCreatedAtAfter(InventoryCountStatus.COMPLETED, yesterday);
        
        if (recentCounts.isEmpty()) {
            log.info("Không có biên bản kiểm kê mới nào trong 24h qua.");
            return;
        }

        for (InventoryCount count : recentCounts) {
            log.info("Đối chiếu biên bản kiểm kê: {}", count.getCountNo());
            
            count.getItems().forEach(item -> {
                // Tồn kho hệ thống lúc kiểm kê
                int systemQty = item.getSystemQuantity();
                // Tồn kho thực tế
                int actualQty = item.getCountedQuantity() != null ? item.getCountedQuantity() : 0;
                
                int diff = actualQty - systemQty;
                
                if (Math.abs(diff) > 5) {
                    // Ngưỡng lệch quá 5 đơn vị => Cảnh báo mạnh
                    log.warn("[CẢNH BÁO MỨC ĐỘ CAO] Lệch tồn kho quá ngưỡng! Kho: {}, Sản phẩm: {}, Lệch: {}", 
                            count.getWarehouse().getWarehouseName(), 
                            item.getProduct().getProductCode(), 
                            diff);
                    // TODO: Gắn service gửi Email/Zalo ZNS cho Quản lý kho
                } else if (diff != 0) {
                    log.info("[Cảnh báo nhẹ] Sai số tồn kho nhỏ. Sản phẩm: {}, Lệch: {}", 
                            item.getProduct().getProductCode(), diff);
                }
            });
        }
        
        log.info("Hoàn tất đối chiếu tồn kho.");
    }
}
