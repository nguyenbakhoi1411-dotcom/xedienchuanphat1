package com.chuanphat.warranty.inventory.service;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.inventory.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Collections;

@Service("inventoryModuleService")
@Transactional(readOnly = true)
public class InventoryModuleService {

    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final GoodsIssueRepository goodsIssueRepository;
    private final InventoryTransferRepository inventoryTransferRepository;
    private final InventoryStockRepository inventoryStockRepository;

    public InventoryModuleService(
            PurchaseReceiptRepository purchaseReceiptRepository,
            GoodsIssueRepository goodsIssueRepository,
            InventoryTransferRepository inventoryTransferRepository,
            InventoryStockRepository inventoryStockRepository) {
        this.purchaseReceiptRepository = purchaseReceiptRepository;
        this.goodsIssueRepository = goodsIssueRepository;
        this.inventoryTransferRepository = inventoryTransferRepository;
        this.inventoryStockRepository = inventoryStockRepository;
    }

    public Page<InwardReceiptDTO> getInwardReceipts(Pageable pageable) {
        return purchaseReceiptRepository.findAll(pageable).map(receipt -> {
            InwardReceiptDTO dto = new InwardReceiptDTO();
            dto.setId(receipt.getId());
            dto.setReceiptNo(receipt.getReceiptNo());
            dto.setReceiptDate(receipt.getReceiptDate());
            dto.setTotalAmount(receipt.getTotalAmount());
            if (receipt.getSupplier() != null) {
                dto.setSupplierName(receipt.getSupplier().getName());
                dto.setSupplierAddress(receipt.getSupplier().getAddress());
            }
            dto.setStatus(receipt.getStatus().name());
            
            dto.setItems(receipt.getItems().stream().map(item -> {
                InwardReceiptDTO.InwardReceiptItemDTO itemDto = new InwardReceiptDTO.InwardReceiptItemDTO();
                itemDto.setId(item.getId());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitCost());
                itemDto.setLineTotal(item.getLineTotal());
                if (item.getProduct() != null) {
                    itemDto.setProductCode(item.getProduct().getProductCode());
                    itemDto.setProductName(item.getProduct().getProductName());
                    itemDto.setUnitName(item.getProduct().getPrimaryUnit());
                }
                if (receipt.getWarehouse() != null) {
                    itemDto.setWarehouseName(receipt.getWarehouse().getWarehouseName());
                }
                return itemDto;
            }).collect(Collectors.toList()));
            return dto;
        });
    }

    public Page<OutwardIssueDTO> getOutwardIssues(Pageable pageable) {
        return goodsIssueRepository.findAll(pageable).map(issue -> {
            OutwardIssueDTO dto = new OutwardIssueDTO();
            dto.setId(issue.getId());
            dto.setIssueNo(issue.getIssueNo());
            dto.setIssueDate(issue.getIssueDate());
            
            // Calculate total amount from items
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (GoodsIssueItem item : issue.getItems()) {
                if (item.getUnitCost() != null) {
                    totalAmount = totalAmount.add(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
            dto.setTotalAmount(totalAmount);
            
            dto.setDescription(issue.getNote());
            dto.setReceiverName(""); // No receiver name in entity
            dto.setStatus(issue.getStatus());
            dto.setIssueType(issue.getIssueType() != null ? issue.getIssueType().name() : null);

            dto.setItems(issue.getItems().stream().map(item -> {
                OutwardIssueDTO.OutwardIssueItemDTO itemDto = new OutwardIssueDTO.OutwardIssueItemDTO();
                itemDto.setId(item.getId());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitCost(item.getUnitCost());
                itemDto.setTotalCost(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())));
                if (item.getProduct() != null) {
                    itemDto.setProductCode(item.getProduct().getProductCode());
                    itemDto.setProductName(item.getProduct().getProductName());
                    itemDto.setUnitName(item.getProduct().getPrimaryUnit());
                }
                if (issue.getWarehouse() != null) {
                    itemDto.setWarehouseName(issue.getWarehouse().getWarehouseName());
                }
                return itemDto;
            }).collect(Collectors.toList()));
            return dto;
        });
    }

    public Page<TransferDTO> getTransfers(Pageable pageable) {
        return inventoryTransferRepository.findAll(pageable).map(transfer -> {
            TransferDTO dto = new TransferDTO();
            dto.setId(transfer.getId());
            dto.setTransferNo(transfer.getTransferNo());
            dto.setTransferDate(transfer.getTransferDate());
            dto.setTotalAmount(transfer.getTransferCost());
            dto.setDescription(transfer.getNote());
            dto.setStatus(transfer.getStatus().name());

            TransferDTO.TransferItemDTO itemDto = new TransferDTO.TransferItemDTO();
            itemDto.setId(transfer.getId());
            itemDto.setQuantity(transfer.getQuantity());
            if (transfer.getProduct() != null) {
                itemDto.setProductCode(transfer.getProduct().getProductCode());
                itemDto.setProductName(transfer.getProduct().getProductName());
                itemDto.setUnitName(transfer.getProduct().getPrimaryUnit());
            }
            if (transfer.getFromWarehouse() != null) {
                itemDto.setFromWarehouseName(transfer.getFromWarehouse().getWarehouseName());
            }
            if (transfer.getToWarehouse() != null) {
                itemDto.setToWarehouseName(transfer.getToWarehouse().getWarehouseName());
            }
            dto.setItems(Collections.singletonList(itemDto));
            
            return dto;
        });
    }

    public DashboardMetricsDTO getDashboardMetrics() {
        DashboardMetricsDTO dto = new DashboardMetricsDTO();
        dto.setLowStockCount(0); // Mock
        dto.setOutOfStockCount(0); // Mock
        dto.setInventoryTurnover(1.5);
        dto.setAverageDaysInInventory(45.0);
        dto.setTotalInventoryValue(BigDecimal.valueOf(15267000000L)); // 15.267 trieu
        dto.setLowStockItems(List.of());
        return dto;
    }
}
