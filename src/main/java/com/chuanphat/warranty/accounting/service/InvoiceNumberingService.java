package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.InvoiceSerialConfig;
import com.chuanphat.warranty.accounting.repository.InvoiceSerialConfigRepository;
import com.chuanphat.warranty.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceNumberingService {

    private final InvoiceSerialConfigRepository configRepository;

    public InvoiceNumberingService(InvoiceSerialConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    /**
     * Cấp số hóa đơn mới nhất cho một ký hiệu.
     * Sử dụng khóa bi quan (PESSIMISTIC_WRITE) để chống race condition.
     * Transaction chạy độc lập (REQUIRES_NEW) để đảm bảo an toàn đồng thời.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateNextInvoiceNo(String mauSo, String kyHieu, int namSuDung) {
        InvoiceSerialConfig config = configRepository.findByMauSoAndKyHieuAndNamSuDungWithLock(mauSo, kyHieu, namSuDung)
                .orElseThrow(() -> new BusinessException("Chưa cấu hình dải số cho ký hiệu " + kyHieu + " năm " + namSuDung));

        if (!"ACTIVE".equals(config.getTrangThai())) {
            throw new BusinessException("Dải số cho ký hiệu " + kyHieu + " không ở trạng thái hoạt động");
        }

        int nextNo = config.getSoHienTai() + 1;
        
        if (nextNo > config.getSoKetThuc()) {
            throw new BusinessException("Đã hết số trong dải số cho ký hiệu " + kyHieu);
        }

        config.setSoHienTai(nextNo);
        configRepository.save(config);

        return String.format("%07d", nextNo); // Theo TT78, số hóa đơn có 7 chữ số (ví dụ 0000001)
    }
}
