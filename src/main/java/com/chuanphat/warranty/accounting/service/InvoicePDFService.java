package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.Invoice;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.service.CustomerService;
// import com.chuanphat.warranty.core.service.ExportDocumentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoicePDFService {

    // private final ExportDocumentService exportDocumentService;
    private final CustomerService customerService;

    public InvoicePDFService(CustomerService customerService) {
        // this.exportDocumentService = exportDocumentService;
        this.customerService = customerService;
    }

    public byte[] generatePdf(Invoice invoice) {
        String customerName = invoice.getTenNguoiMua();
        String customerPhone = "";
        
        if (customerName == null && invoice.getOrder() != null) {
            Customer customer = customerService.get(invoice.getOrder().getCustomerId());
            customerName = customer.getFullName();
            customerPhone = customer.getPhone();
        }
        
        String title = "HÓA ĐƠN GIÁ TRỊ GIA TĂNG";
        if ("INTERNAL".equals(invoice.getLoaiHoaDon())) {
            title = "HÓA ĐƠN BÁN HÀNG NỘI BỘ";
        }
        
        String invoiceNoDisplay = invoice.getSoHoaDon() != null ? invoice.getKyHieu() + "-" + invoice.getSoHoaDon() : invoice.getMaHoaDon();
        
        List<List<String>> items = invoice.getItems().stream().map(item -> List.of(
                item.getTenHangHoa(),
                String.valueOf(item.getSoLuong()),
                item.getDonGia().toPlainString(),
                item.getThanhTien().toPlainString()
        )).collect(Collectors.toList());

        /*
        return exportDocumentService.businessPdf(new ExportDocumentService.BusinessDocument(
                title,
                invoiceNoDisplay,
                invoice.getNgayXuat().toString(),
                customerName != null ? customerName : "Khách hàng lẻ",
                customerPhone,
                "Ngày ký: " + (invoice.getNgayKy() != null ? invoice.getNgayKy().toString() : "Chưa ký") + " | Trạng thái: " + invoice.getTrangThai(),
                List.of("Sản phẩm", "SL", "Đơn giá", "Thành tiền"),
                items,
                invoice.getTongCong()
        ));
        */
        return new byte[0]; // TODO: Implement PDF Generation with iText/OpenPDF
    }
}
