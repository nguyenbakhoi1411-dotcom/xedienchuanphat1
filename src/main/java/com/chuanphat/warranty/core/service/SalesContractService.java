package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.core.dto.SalesContractDTO;
import com.chuanphat.warranty.core.dto.SalesContractItemDTO;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.SalesContract;
import com.chuanphat.warranty.core.entity.SalesContractItem;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.repository.SalesContractRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesContractService {

    private final SalesContractRepository salesContractRepository;
    private final CustomerService customerService;
    private final ProductService productService;
    private final SalesOrderRepository salesOrderRepository;

    public SalesContractService(SalesContractRepository salesContractRepository,
                                CustomerService customerService,
                                ProductService productService,
                                SalesOrderRepository salesOrderRepository) {
        this.salesContractRepository = salesContractRepository;
        this.customerService = customerService;
        this.productService = productService;
        this.salesOrderRepository = salesOrderRepository;
    }

    @Transactional
    public SalesContractDTO createContract(SalesContractDTO dto) {
        SalesContract contract = new SalesContract();
        mapDtoToEntity(dto, contract);
        
        SalesContract saved = salesContractRepository.save(contract);
        return mapEntityToDto(saved);
    }

    @Transactional
    public SalesContractDTO updateContract(Long id, SalesContractDTO dto) {
        SalesContract contract = salesContractRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SalesContract not found: " + id));
                
        mapDtoToEntity(dto, contract);
        
        SalesContract saved = salesContractRepository.save(contract);
        return mapEntityToDto(saved);
    }

    @Transactional(readOnly = true)
    public SalesContractDTO getContract(Long id) {
        SalesContract contract = salesContractRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SalesContract not found: " + id));
        return mapEntityToDto(contract);
    }

    @Transactional(readOnly = true)
    public List<SalesContractDTO> getAllContracts() {
        return salesContractRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteContract(Long id) {
        if (!salesContractRepository.existsById(id)) {
            throw new NotFoundException("SalesContract not found: " + id);
        }
        salesContractRepository.deleteById(id);
    }

    private void mapDtoToEntity(SalesContractDTO dto, SalesContract entity) {
        entity.setContractNo(dto.getContractNo());
        entity.setContractDate(dto.getContractDate());
        
        if (dto.getOrderId() != null) {
            SalesOrder order = salesOrderRepository.findById(dto.getOrderId())
                    .orElseThrow(() -> new NotFoundException("SalesOrder not found: " + dto.getOrderId()));
            entity.setOrder(order);
        }
        if (dto.getCustomerId() != null) {
            Customer customer = customerService.get(dto.getCustomerId());
            entity.setCustomer(customer);
        }

        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "Chưa thực hiện");
        entity.setDeliveryStatus(dto.getDeliveryStatus() != null ? dto.getDeliveryStatus() : "Chưa giao");
        entity.setProjectName(dto.getProjectName());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setLiquidatedAmount(dto.getLiquidatedAmount());
        entity.setLiquidationDate(dto.getLiquidationDate());
        entity.setPaymentTermDate(dto.getPaymentTermDate());
        entity.setAutoLiquidate(dto.getAutoLiquidate() != null ? dto.getAutoLiquidate() : false);
        entity.setNote(dto.getNote());
        entity.setBranchId(dto.getBranchId());
        
        entity.setEcommercePlatform(dto.getEcommercePlatform());
        entity.setShopName(dto.getShopName());
        entity.setStoreCode(dto.getStoreCode());

        if (entity.getId() == null) {
            entity.setCreatedAt(OffsetDateTime.now());
        }

        if (dto.getItems() != null) {
            entity.getItems().clear();
            for (SalesContractItemDTO itemDto : dto.getItems()) {
                SalesContractItem item = new SalesContractItem();
                item.setContract(entity);
                if (itemDto.getProductId() != null) {
                    Product product = productService.get(itemDto.getProductId());
                    item.setProduct(product);
                }
                item.setUnit(itemDto.getUnit());
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setAmount(itemDto.getAmount());
                item.setTaxRate(itemDto.getTaxRate());
                item.setTaxAmount(itemDto.getTaxAmount());
                item.setDiscountRate(itemDto.getDiscountRate());
                item.setDiscountAmount(itemDto.getDiscountAmount());
                item.setNote(itemDto.getNote());
                
                entity.getItems().add(item);
            }
        }
    }

    private SalesContractDTO mapEntityToDto(SalesContract entity) {
        SalesContractDTO dto = new SalesContractDTO();
        dto.setId(entity.getId());
        dto.setContractNo(entity.getContractNo());
        dto.setContractDate(entity.getContractDate());
        if (entity.getOrder() != null) {
            dto.setOrderId(entity.getOrder().getId());
        }
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
        }
        dto.setStatus(entity.getStatus());
        dto.setDeliveryStatus(entity.getDeliveryStatus());
        dto.setProjectName(entity.getProjectName());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setLiquidatedAmount(entity.getLiquidatedAmount());
        dto.setLiquidationDate(entity.getLiquidationDate());
        dto.setPaymentTermDate(entity.getPaymentTermDate());
        dto.setAutoLiquidate(entity.getAutoLiquidate());
        dto.setNote(entity.getNote());
        dto.setBranchId(entity.getBranchId());
        dto.setCreatedAt(entity.getCreatedAt());

        dto.setEcommercePlatform(entity.getEcommercePlatform());
        dto.setShopName(entity.getShopName());
        dto.setStoreCode(entity.getStoreCode());

        List<SalesContractItemDTO> itemDtos = new ArrayList<>();
        if (entity.getItems() != null) {
            for (SalesContractItem item : entity.getItems()) {
                SalesContractItemDTO itemDto = new SalesContractItemDTO();
                itemDto.setId(item.getId());
                if (item.getProduct() != null) {
                    itemDto.setProductId(item.getProduct().getId());
                }
                itemDto.setUnit(item.getUnit());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setAmount(item.getAmount());
                itemDto.setTaxRate(item.getTaxRate());
                itemDto.setTaxAmount(item.getTaxAmount());
                itemDto.setDiscountRate(item.getDiscountRate());
                itemDto.setDiscountAmount(item.getDiscountAmount());
                itemDto.setNote(item.getNote());
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);

        return dto;
    }
}
