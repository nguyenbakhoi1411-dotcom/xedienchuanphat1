package com.chuanphat.warranty.accounting.listener;

import com.chuanphat.warranty.accounting.service.InvoiceService;
import com.chuanphat.warranty.accounting.service.InvoiceInputService;
import com.chuanphat.warranty.accounting.dto.InvoiceDtos.CreateInvoiceRequest;
import com.chuanphat.warranty.accounting.dto.InvoiceDtos.CreateInvoiceItemRequest;
import com.chuanphat.warranty.accounting.dto.InvoiceDtos.CreateInvoiceInputRequest;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.event.SalesOrderDeliveredEvent;
import com.chuanphat.warranty.core.event.PurchaseOrderReceivedEvent;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Component
public class InvoiceEventListener {

    private final InvoiceService invoiceService;
    private final InvoiceInputService invoiceInputService;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public InvoiceEventListener(
            InvoiceService invoiceService,
            InvoiceInputService invoiceInputService,
            SalesOrderRepository salesOrderRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.invoiceService = invoiceService;
        this.invoiceInputService = invoiceInputService;
        this.salesOrderRepository = salesOrderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @EventListener
    @Transactional
    public void handleSalesOrderDelivered(SalesOrderDeliveredEvent event) {
        salesOrderRepository.findById(event.getOrderId()).ifPresent(order -> {
            CreateInvoiceRequest request = new CreateInvoiceRequest(
                    order.getId(),
                    "1", // Hóa đơn Giá trị gia tăng
                    "TM/CK",
                    order.getItems().stream().map(item -> new CreateInvoiceItemRequest(
                            item.getProduct().getId(),
                            item.getProduct().getProductName(),
                            "Cái", // default uom
                            item.getQuantity(),
                            item.getUnitPrice(),
                            java.math.BigDecimal.valueOf(10) // default 10% VAT
                    )).collect(Collectors.toList())
            );
            invoiceService.createOutputInvoice(request);
        });
    }

    @EventListener
    @Transactional
    public void handlePurchaseOrderReceived(PurchaseOrderReceivedEvent event) {
        purchaseOrderRepository.findById(event.getOrderId()).ifPresent(po -> {
            CreateInvoiceInputRequest request = new CreateInvoiceInputRequest(
                    null,
                    null,
                    null,
                    java.time.LocalDate.now(),
                    po.getSupplier().getId(),
                    po.getTotalAmount(),
                    java.math.BigDecimal.valueOf(10),
                    po.getId(),
                    "Tự động tạo từ PurchaseOrder #" + po.getPurchaseOrderNo()
            );
            invoiceInputService.createInputInvoice(request);
        });
    }
}
