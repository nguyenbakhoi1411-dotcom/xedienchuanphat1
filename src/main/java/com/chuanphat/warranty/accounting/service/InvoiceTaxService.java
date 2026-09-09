package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.Invoice;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class InvoiceTaxService {

    /**
     * Ký điện tử và gửi hóa đơn lên cơ quan thuế
     * Giả lập việc gọi API của nhà cung cấp HDĐT (MISA, VNPT...)
     */
    public Invoice signAndSendToTaxAuthority(Invoice invoice) {
        // TODO: Gọi API thực tế của nhà cung cấp hóa đơn điện tử
        // invoice.setElectronicInvoiceStatus("SENT_TO_TAX_AUTHORITY");
        invoice.setDaKyDienTu(true);
        invoice.setNgayKy(OffsetDateTime.now());
        invoice.setNgayGuiCqt(OffsetDateTime.now());
        
        return invoice;
    }

    public void cancelElectronicInvoice(Invoice invoice, String reason) {
        // invoice.setElectronicInvoiceStatus("CANCELLED");
        invoice.setDaKyDienTu(false);
    }
}
