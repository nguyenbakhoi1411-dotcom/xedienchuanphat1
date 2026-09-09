package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.TaxInvoice;
import com.chuanphat.warranty.core.entity.TaxInvoiceLine;
import com.chuanphat.warranty.core.repository.TaxInvoiceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MisaExportService {

    private final TaxInvoiceRepository invoiceRepository;

    public MisaExportService(TaxInvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Xuất dữ liệu bán hàng chuẩn MISA (CSV định dạng có thể import vào MISA AMIS/SME).
     * Thông thường thực tế sẽ dùng Apache POI xuất .xlsx, ở đây demo xuất định dạng CSV.
     */
    public byte[] exportToMisaFormat(LocalDate fromDate, LocalDate toDate) {
        List<TaxInvoice> invoices = invoiceRepository.findAll(); // Simplify for demo, should filter by date

        StringBuilder csv = new StringBuilder();
        // Header tương thích MISA
        csv.append("Ngày hạch toán,Ngày chứng từ,Số chứng từ,Mã khách hàng,Tên khách hàng,Địa chỉ,Mã hàng,Tên hàng,ĐVT,Số lượng,Đơn giá,Thành tiền,TK Nợ,TK Có,Thuế suất GTGT,Tiền thuế GTGT,TK Thuế GTGT\n");

        for (TaxInvoice invoice : invoices) {
            String invoiceDate = invoice.getInvoiceDate().toString();
            String invoiceNo = invoice.getInvoiceNo();
            String customerCode = invoice.getCustomer() != null && invoice.getCustomer().getTaxUnitCode() != null 
                ? invoice.getCustomer().getTaxUnitCode() : "KH_LE";
            String customerName = invoice.getCustomerName() != null ? invoice.getCustomerName().replace(",", "") : "";
            String customerAddress = invoice.getCustomerAddress() != null ? invoice.getCustomerAddress().replace(",", "") : "";

            for (TaxInvoiceLine line : invoice.getLines()) {
                String productCode = line.getProductCode() != null ? line.getProductCode() : "NO_CODE";
                String productName = line.getProductName() != null ? line.getProductName().replace(",", "") : "";
                String unit = line.getUnit() != null ? line.getUnit() : "CAI";
                
                // MISA Accounting rules mapping:
                // TK Nợ: 131 (Phải thu khách hàng)
                // TK Có: 5111 (Doanh thu bán hàng hóa)
                // TK Thuế GTGT: 33311 (Thuế GTGT đầu ra)
                
                csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,131,5111,%s,%s,33311\n",
                        invoiceDate, invoiceDate, invoiceNo,
                        customerCode, customerName, customerAddress,
                        productCode, productName, unit,
                        line.getQuantity(), line.getUnitPrice(), line.getTotalPrice(),
                        line.getVatRate(), line.getVatAmount()
                ));
            }
        }

        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
