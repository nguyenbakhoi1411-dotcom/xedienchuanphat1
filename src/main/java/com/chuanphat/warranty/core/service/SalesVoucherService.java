package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.core.dto.SalesVoucherDTO;
import com.chuanphat.warranty.core.dto.SalesVoucherItemDTO;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesVoucher;
import com.chuanphat.warranty.core.entity.SalesVoucherItem;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesVoucherRepository;
import com.chuanphat.warranty.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service("coreSalesVoucherService")
public class SalesVoucherService {

    private final SalesVoucherRepository salesVoucherRepository;
    private final CustomerService customerService;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final SalesOrderRepository salesOrderRepository;

    public SalesVoucherService(SalesVoucherRepository salesVoucherRepository,
                               CustomerService customerService,
                               ProductService productService,
                               InventoryService inventoryService,
                               SalesOrderRepository salesOrderRepository) {
        this.salesVoucherRepository = salesVoucherRepository;
        this.customerService = customerService;
        this.productService = productService;
        this.inventoryService = inventoryService;
        this.salesOrderRepository = salesOrderRepository;
    }

    @Transactional
    public SalesVoucherDTO createSalesVoucher(SalesVoucherDTO dto) {
        SalesVoucher voucher = new SalesVoucher();
        mapDtoToEntity(dto, voucher);
        
        // Full cascading persistence is enabled by cascade = CascadeType.ALL on items in entity
        SalesVoucher savedVoucher = salesVoucherRepository.save(voucher);
        return mapEntityToDto(savedVoucher);
    }

    @Transactional
    public SalesVoucherDTO updateSalesVoucher(Long id, SalesVoucherDTO dto) {
        SalesVoucher voucher = salesVoucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SalesVoucher not found with id: " + id));
        
        mapDtoToEntity(dto, voucher);
        
        SalesVoucher savedVoucher = salesVoucherRepository.save(voucher);
        return mapEntityToDto(savedVoucher);
    }

    @Transactional(readOnly = true)
    public SalesVoucherDTO getSalesVoucher(Long id) {
        SalesVoucher voucher = salesVoucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SalesVoucher not found with id: " + id));
        return mapEntityToDto(voucher);
    }

    @Transactional(readOnly = true)
    public List<SalesVoucherDTO> getAllSalesVouchers() {
        return salesVoucherRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSalesVoucher(Long id) {
        if (!salesVoucherRepository.existsById(id)) {
            throw new NotFoundException("SalesVoucher not found with id: " + id);
        }
        salesVoucherRepository.deleteById(id);
    }

    private void mapDtoToEntity(SalesVoucherDTO dto, SalesVoucher entity) {
        entity.setVoucherNo(dto.getVoucherNo());
        entity.setVoucherDate(dto.getVoucherDate());
        entity.setAccountingDate(dto.getAccountingDate());
        
        if (dto.getCustomerId() != null) {
            Customer customer = customerService.get(dto.getCustomerId());
            entity.setCustomer(customer);
        }
        if (dto.getOrderId() != null) {
            SalesOrder order = salesOrderRepository.findById(dto.getOrderId())
                    .orElseThrow(() -> new NotFoundException("SalesOrder not found: " + dto.getOrderId()));
            entity.setOrder(order);
        }

        entity.setSalesperson(dto.getSalesperson());
        entity.setDescription(dto.getDescription());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setIsExportVoucher(dto.getIsExportVoucher() != null ? dto.getIsExportVoucher() : false);
        entity.setIsTaxInvoice(dto.getIsTaxInvoice() != null ? dto.getIsTaxInvoice() : false);
        entity.setTaxInvoiceNo(dto.getTaxInvoiceNo());
        entity.setInvoiceIssueStatus(dto.getInvoiceIssueStatus() != null ? dto.getInvoiceIssueStatus() : "CHUA_PHAT_HANH");
        entity.setTaxAuthorityCode(dto.getTaxAuthorityCode());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setTotalTaxAmount(dto.getTotalTaxAmount());
        entity.setTotalPayment(dto.getTotalPayment());
        entity.setBranchId(dto.getBranchId());
        
        entity.setPaymentTerm(dto.getPaymentTerm());
        entity.setEcommercePlatform(dto.getEcommercePlatform());
        entity.setShopName(dto.getShopName());
        entity.setStoreCode(dto.getStoreCode());
        entity.setDeliveryStatus(dto.getDeliveryStatus());
        entity.setInvoiceSearchCode(dto.getInvoiceSearchCode());
        entity.setIsCashPayment(dto.getIsCashPayment());

        if (entity.getId() == null) {
            entity.setCreatedAt(OffsetDateTime.now());
        }

        if (dto.getItems() != null) {
            entity.getItems().clear();
            for (SalesVoucherItemDTO itemDto : dto.getItems()) {
                SalesVoucherItem item = new SalesVoucherItem();
                item.setVoucher(entity);
                
                if (itemDto.getProductId() != null) {
                    Product product = productService.get(itemDto.getProductId());
                    item.setProduct(product);
                }
                
                if (itemDto.getWarehouseId() != null) {
                    Warehouse warehouse = inventoryService.getWarehouse(itemDto.getWarehouseId());
                    item.setWarehouse(warehouse);
                }
                
                item.setUnit(itemDto.getUnit());
                item.setDebitAccount(itemDto.getDebitAccount());
                item.setCreditAccount(itemDto.getCreditAccount());
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setAmount(itemDto.getAmount());
                item.setTaxRate(itemDto.getTaxRate());
                item.setTaxAmount(itemDto.getTaxAmount());
                item.setTaxAccount(itemDto.getTaxAccount());
                item.setCogsDebitAccount(itemDto.getCogsDebitAccount());
                item.setCogsCreditAccount(itemDto.getCogsCreditAccount());
                item.setCogsAmount(itemDto.getCogsAmount());
                item.setIsPromotionalItem(itemDto.getIsPromotionalItem() != null ? itemDto.getIsPromotionalItem() : false);
                item.setHasCommercialDiscount(itemDto.getHasCommercialDiscount() != null ? itemDto.getHasCommercialDiscount() : false);
                item.setDiscountRate(itemDto.getDiscountRate());
                item.setDiscountAmount(itemDto.getDiscountAmount());
                item.setDiscountAccount(itemDto.getDiscountAccount());
                item.setBatchNumber(itemDto.getBatchNumber());
                item.setExpiryDate(itemDto.getExpiryDate());
                
                item.setSpecification(itemDto.getSpecification());
                item.setLicensePlate(itemDto.getLicensePlate());
                
                entity.getItems().add(item);
            }
        }
    }

    private SalesVoucherDTO mapEntityToDto(SalesVoucher entity) {
        SalesVoucherDTO dto = new SalesVoucherDTO();
        dto.setId(entity.getId());
        dto.setVoucherNo(entity.getVoucherNo());
        dto.setVoucherDate(entity.getVoucherDate());
        dto.setAccountingDate(entity.getAccountingDate());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
        }
        if (entity.getOrder() != null) {
            dto.setOrderId(entity.getOrder().getId());
        }
        dto.setSalesperson(entity.getSalesperson());
        dto.setDescription(entity.getDescription());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setIsExportVoucher(entity.getIsExportVoucher());
        dto.setIsTaxInvoice(entity.getIsTaxInvoice());
        dto.setTaxInvoiceNo(entity.getTaxInvoiceNo());
        dto.setInvoiceIssueStatus(entity.getInvoiceIssueStatus());
        dto.setTaxAuthorityCode(entity.getTaxAuthorityCode());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setTotalTaxAmount(entity.getTotalTaxAmount());
        dto.setTotalPayment(entity.getTotalPayment());
        dto.setBranchId(entity.getBranchId());
        dto.setCreatedAt(entity.getCreatedAt());

        dto.setPaymentTerm(entity.getPaymentTerm());
        dto.setEcommercePlatform(entity.getEcommercePlatform());
        dto.setShopName(entity.getShopName());
        dto.setStoreCode(entity.getStoreCode());
        dto.setDeliveryStatus(entity.getDeliveryStatus());
        dto.setInvoiceSearchCode(entity.getInvoiceSearchCode());
        dto.setIsCashPayment(entity.getIsCashPayment());

        List<SalesVoucherItemDTO> itemDtos = new ArrayList<>();
        if (entity.getItems() != null) {
            for (SalesVoucherItem item : entity.getItems()) {
                SalesVoucherItemDTO itemDto = new SalesVoucherItemDTO();
                itemDto.setId(item.getId());
                if (item.getProduct() != null) {
                    itemDto.setProductId(item.getProduct().getId());
                }
                if (item.getWarehouse() != null) {
                    itemDto.setWarehouseId(item.getWarehouse().getId());
                }
                itemDto.setUnit(item.getUnit());
                itemDto.setDebitAccount(item.getDebitAccount());
                itemDto.setCreditAccount(item.getCreditAccount());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setAmount(item.getAmount());
                itemDto.setTaxRate(item.getTaxRate());
                itemDto.setTaxAmount(item.getTaxAmount());
                itemDto.setTaxAccount(item.getTaxAccount());
                itemDto.setCogsDebitAccount(item.getCogsDebitAccount());
                itemDto.setCogsCreditAccount(item.getCogsCreditAccount());
                itemDto.setCogsAmount(item.getCogsAmount());
                itemDto.setIsPromotionalItem(item.getIsPromotionalItem());
                itemDto.setHasCommercialDiscount(item.getHasCommercialDiscount());
                itemDto.setDiscountRate(item.getDiscountRate());
                itemDto.setDiscountAmount(item.getDiscountAmount());
                itemDto.setDiscountAccount(item.getDiscountAccount());
                itemDto.setBatchNumber(item.getBatchNumber());
                itemDto.setExpiryDate(item.getExpiryDate());
                
                itemDto.setSpecification(item.getSpecification());
                itemDto.setLicensePlate(item.getLicensePlate());
                
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);

        return dto;
    }
}
