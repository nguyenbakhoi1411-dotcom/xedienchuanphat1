package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.InvoiceDtos.*;
import com.chuanphat.warranty.accounting.entity.Invoice;
import com.chuanphat.warranty.accounting.entity.InvoiceItem;
import com.chuanphat.warranty.accounting.repository.InvoiceItemRepository;
import com.chuanphat.warranty.accounting.repository.InvoiceRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceNumberingService numberingService;
    private final InvoiceTaxService taxService;
    private final BranchSecurity branchSecurity;
    private final CustomerService customerService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            InvoiceItemRepository invoiceItemRepository,
            SalesOrderRepository salesOrderRepository,
            InvoiceNumberingService numberingService,
            InvoiceTaxService taxService,
            BranchSecurity branchSecurity,
            CustomerService customerService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.numberingService = numberingService;
        this.taxService = taxService;
        this.branchSecurity = branchSecurity;
        this.customerService = customerService;
    }

    @Transactional(readOnly = true)
    public PageResponse<InvoiceDto> listOutputInvoices(Long branchId, String status, int page, int pageSize) {
        Page<Invoice> invoices;
        if (status != null && !status.isEmpty()) {
            invoices = invoiceRepository.findAll(PageRequest.of(page, pageSize, Sort.by("id").descending()));
        } else {
            invoices = invoiceRepository.findAll(PageRequest.of(page, pageSize, Sort.by("id").descending()));
        }
        return PageResponse.from(invoices.map(this::mapToDto));
    }

    @Transactional
    public InvoiceDto createOutputInvoice(CreateInvoiceRequest request) {
        SalesOrder order = salesOrderRepository.findById(request.orderId())
                .orElseThrow(() -> new NotFoundException("Order not found: " + request.orderId()));
        branchSecurity.requireBranchAccess(order.getBranchId());

        Customer customer = customerService.get(order.getCustomerId());

        Invoice invoice = new Invoice();
        invoice.setMaHoaDon("HD-" + System.currentTimeMillis()); // Temporary code
        invoice.setLoaiHoaDon(request.loaiHoaDon());
        invoice.setNgayXuat(LocalDate.now());
        invoice.setOrder(order);
        
        invoice.setTenNguoiMua(customer.getFullName());
        // invoice.setSoDienThoaiNguoiMua(customer.getPhone());
        // Lấy mã số thuế nếu có, hiện tại customer chưa có taxCode rõ ràng trong entity, có thể thêm sau
        invoice.setMaSoThueNguoiMua(null);
        invoice.setHinhThucTt(request.hinhThucThanhToan());
        
        // invoice.setElectronicInvoiceStatus("READY");
        invoice.setDaKyDienTu(false);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        List<InvoiceItem> items = request.items().stream().map(dto -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(savedInvoice);
            item.setTenHangHoa(dto.tenHangHoa());
            item.setDonViTinh(dto.donViTinh());
            item.setSoLuong(java.math.BigDecimal.valueOf(dto.soLuong()));
            item.setDonGia(dto.donGia());
            item.setThanhTien(dto.donGia().multiply(java.math.BigDecimal.valueOf(dto.soLuong())));
            item.setThueSuat(dto.thueSuat());
            item.setTienThue(item.getThanhTien().multiply(dto.thueSuat()).divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP));
            return item;
        }).collect(Collectors.toList());

        invoiceItemRepository.saveAll(items);

        savedInvoice.setTongTienTruocThue(items.stream().map(InvoiceItem::getThanhTien).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        savedInvoice.setTongThueGtgt(items.stream().map(InvoiceItem::getTienThue).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        savedInvoice.setTongCong(savedInvoice.getTongTienTruocThue().add(savedInvoice.getTongThueGtgt()));

        return mapToDto(invoiceRepository.save(savedInvoice));
    }

    @Transactional
    public InvoiceDto issueInvoice(Long id, IssueInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        branchSecurity.requireBranchAccess(invoice.getOrder().getBranchId());

        if (!"DRAFT".equals(invoice.getTrangThai())) {
            throw new BusinessException("Chỉ có thể phát hành hóa đơn nháp");
        }

        int year = LocalDate.now().getYear();
        String invoiceNo = numberingService.generateNextInvoiceNo(request.mauSo(), request.kyHieu(), year);

        invoice.setMauSo(request.mauSo());
        invoice.setKyHieu(request.kyHieu());
        invoice.setSoHoaDon(invoiceNo);
        invoice.setTrangThai("ISSUED");

        if ("VAT".equals(invoice.getLoaiHoaDon())) {
            taxService.signAndSendToTaxAuthority(invoice);
        }

        return mapToDto(invoiceRepository.save(invoice));
    }

    public InvoiceDto getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        branchSecurity.requireBranchAccess(invoice.getOrder().getBranchId());
        return mapToDto(invoice);
    }

    private InvoiceDto mapToDto(Invoice invoice) {
        return new InvoiceDto(
                invoice.getId(), invoice.getMaHoaDon(), invoice.getLoaiHoaDon(), invoice.getMauSo(), invoice.getKyHieu(),
                invoice.getSoHoaDon(), invoice.getSoHoaDonGoc() != null ? invoice.getSoHoaDonGoc().getId() : null, invoice.getNgayXuat(), invoice.getNgayKy(),
                invoice.getNgayGuiCqt(), invoice.getOrder() != null ? invoice.getOrder().getId() : null,
                invoice.getTenNguoiBan(), invoice.getDiaChiNguoiBan(), invoice.getMaSoThueNguoiBan(),
                invoice.getTenNguoiMua(), invoice.getDiaChiNguoiMua(), invoice.getMaSoThueNguoiMua(),
                invoice.getHinhThucTt(), invoice.getTongTienTruocThue(), invoice.getTongThueGtgt(),
                invoice.getTongCong(), invoice.getTrangThai(), invoice.getMaCqt(),
                invoice.getLyDoHuy(), invoice.getNgayTao(),
                invoice.getItems() != null ? invoice.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()) : new ArrayList<>()
        );
    }

    private InvoiceItemDto mapItemToDto(InvoiceItem item) {
        return new InvoiceItemDto(
                item.getId(), null, item.getTenHangHoa(), item.getDonViTinh(),
                item.getSoLuong() != null ? item.getSoLuong().intValue() : 0, item.getDonGia(), item.getThanhTien(), item.getThueSuat(), item.getTienThue()
        );
    }
}
