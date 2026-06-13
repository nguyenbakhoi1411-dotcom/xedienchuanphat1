package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.TaxInvoice;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public class TaxInvoiceDtos {

    public record TaxInvoiceResponse(
            Long id,
            String invoiceCode,
            String invoiceSerial,
            LocalDate invoiceDate,
            String invoiceType,
            String status,
            Long customerId,
            Long supplierId,
            String eInvoiceProvider,
            String eInvoiceNo,
            String eInvoiceStatus,
            BigDecimal taxBaseAmount,
            BigDecimal vatRate,
            BigDecimal vatAmount,
            BigDecimal totalAmount,
            String relatedOrderNo,
            String relatedReturnNo,
            Long branchId,
            String createdBy,
            OffsetDateTime createdAt,
            OffsetDateTime issuedAt,
            String note
    ) {
        public static TaxInvoiceResponse from(TaxInvoice t) {
            return new TaxInvoiceResponse(
                    t.getId(), t.getInvoiceCode(), t.getInvoiceSerial(),
                    t.getInvoiceDate(), t.getInvoiceType(), t.getStatus(),
                    t.getCustomerId(), t.getSupplierId(),
                    t.getEInvoiceProvider(), t.getEInvoiceNo(), t.getEInvoiceStatus(),
                    t.getTaxBaseAmount(), t.getVatRate(), t.getVatAmount(), t.getTotalAmount(),
                    t.getRelatedOrderNo(), t.getRelatedReturnNo(),
                    t.getBranchId(), t.getCreatedBy(), t.getCreatedAt(), t.getIssuedAt(), t.getNote()
            );
        }
    }

    public record CreateTaxInvoiceRequest(
            String invoiceCode,
            String invoiceSerial,
            LocalDate invoiceDate,
            Long customerId,
            Long supplierId,
            BigDecimal taxBaseAmount,
            BigDecimal vatRate,
            BigDecimal vatAmount,     // null thì tự tính từ taxBase × vatRate
            String relatedOrderNo,
            String relatedReturnNo,
            Long branchId,
            String note
    ) {}

    public record CancelInvoiceRequest(String reason) {}

    /** Báo cáo thuế VAT theo tháng */
    public record VatReportResponse(
            int year,
            int month,
            Long branchId,
            // Đầu ra (bán hàng)
            BigDecimal outputTaxBase,
            BigDecimal outputVatAmount,
            // Đầu vào (mua hàng)
            BigDecimal inputTaxBase,
            BigDecimal inputVatAmount,
            // Kết quả
            BigDecimal vatPayable,      // outputVat - inputVat (nếu dương)
            BigDecimal vatRefundable,   // inputVat - outputVat (nếu âm)
            // Chi tiết
            List<TaxInvoiceResponse> outputInvoices,
            List<TaxInvoiceResponse> inputInvoices
    ) {}
}
