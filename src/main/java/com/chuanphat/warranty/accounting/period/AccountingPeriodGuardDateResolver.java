package com.chuanphat.warranty.accounting.period;

import com.chuanphat.warranty.core.entity.GoodsIssue;
import com.chuanphat.warranty.core.entity.InstallmentApplication;
import com.chuanphat.warranty.core.entity.Invoice;
import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.core.entity.Payable;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReturn;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.accounting.entity.TaxInvoice;
import com.chuanphat.warranty.core.repository.GoodsIssueRepository;
import com.chuanphat.warranty.core.repository.InstallmentApplicationRepository;
import com.chuanphat.warranty.core.repository.InvoiceRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.core.repository.PayableRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.PurchaseReturnRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesReturnRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.accounting.repository.TaxInvoiceRepository;
import com.chuanphat.warranty.exception.NotFoundException;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component("periodGuardDateResolver")
public class AccountingPeriodGuardDateResolver {
    private final SalesOrderRepository salesOrderRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;
    private final SupplierInvoiceRepository supplierInvoiceRepository;
    private final PayableRepository payableRepository;
    private final GoodsIssueRepository goodsIssueRepository;
    private final TaxInvoiceRepository taxInvoiceRepository;
    private final InvoiceRepository invoiceRepository;
    private final InstallmentApplicationRepository installmentRepository;
    private final JournalEntryRepository journalEntryRepository;

    public AccountingPeriodGuardDateResolver(
            SalesOrderRepository salesOrderRepository,
            SalesReturnRepository salesReturnRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseReceiptRepository purchaseReceiptRepository,
            PurchaseReturnRepository purchaseReturnRepository,
            SupplierInvoiceRepository supplierInvoiceRepository,
            PayableRepository payableRepository,
            GoodsIssueRepository goodsIssueRepository,
            TaxInvoiceRepository taxInvoiceRepository,
            InvoiceRepository invoiceRepository,
            InstallmentApplicationRepository installmentRepository,
            JournalEntryRepository journalEntryRepository
    ) {
        this.salesOrderRepository = salesOrderRepository;
        this.salesReturnRepository = salesReturnRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseReceiptRepository = purchaseReceiptRepository;
        this.purchaseReturnRepository = purchaseReturnRepository;
        this.supplierInvoiceRepository = supplierInvoiceRepository;
        this.payableRepository = payableRepository;
        this.goodsIssueRepository = goodsIssueRepository;
        this.taxInvoiceRepository = taxInvoiceRepository;
        this.invoiceRepository = invoiceRepository;
        this.installmentRepository = installmentRepository;
        this.journalEntryRepository = journalEntryRepository;
    }

    public LocalDate salesOrderDate(Long id) {
        return salesOrder(id).getOrderDate();
    }

    public Long salesOrderBranchId(Long id) {
        return salesOrder(id).getBranchId();
    }

    public LocalDate salesReturnDate(Long id) {
        return salesReturn(id).getReturnDate();
    }

    public Long salesReturnBranchId(Long id) {
        return salesReturn(id).getBranchId();
    }

    public LocalDate purchaseOrderDate(Long id) {
        return purchaseOrder(id).getPurchaseDate();
    }

    public Long purchaseOrderBranchId(Long id) {
        return purchaseOrder(id).getBranchId();
    }

    public LocalDate purchaseReceiptDate(Long id) {
        return purchaseReceipt(id).getReceiptDate();
    }

    public Long purchaseReceiptBranchId(Long id) {
        return purchaseReceipt(id).getBranchId();
    }

    public LocalDate purchaseReturnDate(Long id) {
        return purchaseReturn(id).getReturnDate();
    }

    public Long purchaseReturnBranchId(Long id) {
        return purchaseReturn(id).getBranchId();
    }

    public LocalDate supplierInvoiceDate(Long id) {
        return supplierInvoice(id).getInvoiceDate();
    }

    public Long supplierInvoiceBranchId(Long id) {
        return supplierInvoice(id).getBranchId();
    }

    public LocalDate payableInvoiceDate(Long id) {
        return payable(id).getInvoiceDate();
    }

    public Long payableBranchId(Long id) {
        return payable(id).getBranchId();
    }

    public LocalDate goodsIssueDate(Long id) {
        return goodsIssue(id).getIssueDate();
    }

    public Long goodsIssueBranchId(Long id) {
        return goodsIssue(id).getBranchId();
    }

    public LocalDate taxInvoiceDate(Long id) {
        return taxInvoice(id).getInvoiceDate();
    }

    public Long taxInvoiceBranchId(Long id) {
        return taxInvoice(id).getBranchId();
    }

    public LocalDate invoiceDate(Long id) {
        return invoice(id).getInvoiceDate();
    }

    public Long invoiceBranchId(Long id) {
        return invoice(id).getOrder().getBranchId();
    }

    public Long installmentBranchId(Long id) {
        return installment(id).getOrder().getBranchId();
    }

    public LocalDate journalEntryDate(Long id) {
        return journalEntry(id).getEntryDate();
    }

    public Long journalEntryBranchId(Long id) {
        return journalEntry(id).getBranchId();
    }

    private SalesOrder salesOrder(Long id) {
        return salesOrderRepository.findById(id).orElseThrow(() -> new NotFoundException("Sales order not found: " + id));
    }

    private SalesReturn salesReturn(Long id) {
        return salesReturnRepository.findById(id).orElseThrow(() -> new NotFoundException("Sales return not found: " + id));
    }

    private PurchaseOrder purchaseOrder(Long id) {
        return purchaseOrderRepository.findById(id).orElseThrow(() -> new NotFoundException("Purchase order not found: " + id));
    }

    private PurchaseReceipt purchaseReceipt(Long id) {
        return purchaseReceiptRepository.findById(id).orElseThrow(() -> new NotFoundException("Purchase receipt not found: " + id));
    }

    private PurchaseReturn purchaseReturn(Long id) {
        return purchaseReturnRepository.findById(id).orElseThrow(() -> new NotFoundException("Purchase return not found: " + id));
    }

    private SupplierInvoice supplierInvoice(Long id) {
        return supplierInvoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Supplier invoice not found: " + id));
    }

    private Payable payable(Long id) {
        return payableRepository.findById(id).orElseThrow(() -> new NotFoundException("Payable not found: " + id));
    }

    private GoodsIssue goodsIssue(Long id) {
        return goodsIssueRepository.findById(id).orElseThrow(() -> new NotFoundException("Goods issue not found: " + id));
    }

    private TaxInvoice taxInvoice(Long id) {
        return taxInvoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Tax invoice not found: " + id));
    }

    private Invoice invoice(Long id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
    }

    private InstallmentApplication installment(Long id) {
        return installmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Installment not found: " + id));
    }

    private JournalEntry journalEntry(Long id) {
        return journalEntryRepository.findById(id).orElseThrow(() -> new NotFoundException("Journal entry not found: " + id));
    }
}
