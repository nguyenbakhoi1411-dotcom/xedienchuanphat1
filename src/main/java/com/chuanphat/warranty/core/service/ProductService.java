package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.dto.PageRequestFactory;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.ProductDto;
import com.chuanphat.warranty.core.dto.ProductSerialDto;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import com.chuanphat.warranty.pricing.enums.PriceHistorySourceType;
import com.chuanphat.warranty.pricing.repository.ProductPriceHistoryRepository;
import com.chuanphat.warranty.pricing.service.PriceCalculationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chuanphat.warranty.core.repository.ProductSerialHistoryRepository;
import com.chuanphat.warranty.core.dto.ProductSerialHistoryDto;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    private static final Map<String, String> PRODUCT_SORTS = Map.of(
            "id", "id",
            "productCode", "productCode",
            "productName", "productName",
            "category", "category",
            "brand", "brand",
            "salePrice", "salePrice",
            "importPrice", "importPrice",
            "warrantyMonths", "warrantyMonths"
    );
    private static final Map<String, String> SERIAL_SORTS = Map.of(
            "id", "id",
            "serialNumber", "serialNumber",
            "importDate", "importDate",
            "status", "status",
            "purchaseCost", "purchaseCost"
    );

    private final ProductRepository productRepository;
    private final ProductSerialRepository serialRepository;
    private final ProductSerialHistoryRepository historyRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;
    private final PriceCalculationService priceCalculationService;
    private final BranchSecurity branchSecurity;

    public ProductService(
            ProductRepository productRepository,
            ProductSerialRepository serialRepository,
            ProductSerialHistoryRepository historyRepository,
            ProductPriceHistoryRepository priceHistoryRepository,
            PriceCalculationService priceCalculationService,
            BranchSecurity branchSecurity
    ) {
        this.productRepository = productRepository;
        this.serialRepository = serialRepository;
        this.historyRepository = historyRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.priceCalculationService = priceCalculationService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> list(String keyword, ProductCategory category, int page, int pageSize, String sort) {
        String search = keyword == null ? "" : keyword;
        PageRequest pageRequest = PageRequestFactory.of(page, pageSize, sort, PRODUCT_SORTS, "productName,asc");
        if (category == null) {
            return PageResponse.from(productRepository
                    .findByStatusNotAndProductNameContainingIgnoreCase(RecordStatus.DELETED, search, pageRequest)
                    .map(ProductDto::from));
        }
        return PageResponse.from(productRepository
                .findByStatusNotAndCategoryAndProductNameContainingIgnoreCase(RecordStatus.DELETED, category, search, pageRequest)
                .map(ProductDto::from));
    }

    @Transactional
    public ProductDto create(ProductDto request) {
        if (productRepository.existsByProductCodeIgnoreCase(request.productCode())) {
            throw new BusinessException("Product code already exists");
        }
        Product product = new Product();
        apply(product, request);
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public ProductDto update(Long id, ProductDto request) {
        Product product = get(id);
        if (product.getSalePrice().compareTo(request.salePrice()) != 0 || product.getImportPrice().compareTo(request.importPrice()) != 0) {
            if (!hasAuthority("EDIT_BASE_PRICE")) {
                throw new AccessDeniedException("EDIT_BASE_PRICE permission is required to update base product price");
            }
            priceCalculationService.recordPriceHistory(product.getId(), product.getImportPrice(), request.importPrice(), product.getSalePrice(), request.salePrice(), PriceHistorySourceType.MANUAL_UPDATE, product.getId(), null, "Manual product price update", null);
        }
        apply(product, request);
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = get(id);
        product.setStatus(RecordStatus.DELETED);
        productRepository.save(product);
    }

    @Transactional
    public ProductSerialDto createSerial(ProductSerialDto request) {
        branchSecurity.requireBranchAccess(request.branchId());
        if (serialRepository.existsBySerialNumberIgnoreCase(request.serialNumber())) {
            throw new BusinessException("Serial already exists");
        }
        ProductSerial serial = new ProductSerial();
        serial.setProduct(get(request.productId()));
        serial.setSerialNumber(request.serialNumber());
        serial.setBranchId(request.branchId());
        serial.setFrameNumber(request.frameNumber());
        serial.setEngineNumber(request.engineNumber());
        serial.setBatterySerial(request.batterySerial());
        serial.setMotorSerial(request.motorSerial());
        serial.setChargerNumber(request.chargerNumber());
        serial.setColor(request.color());
        serial.setVersion(request.version());
        serial.setSupplierId(request.supplierId());
        serial.setPurchaseCost(request.purchaseCost());
        serial.setNote(request.note());
        if (request.importDate() != null) {
            serial.setImportDate(request.importDate());
        }
        serial.setStatus(request.status() == null ? SerialStatus.IN_STOCK : request.status());
        return ProductSerialDto.from(serialRepository.save(serial));
    }

    @Transactional(readOnly = true)
    public List<ProductSerialHistoryDto> getSerialHistory(Long serialId) {
        ProductSerial serial = serialRepository.findById(serialId)
                .orElseThrow(() -> new NotFoundException("Product serial not found: " + serialId));
        branchSecurity.requireBranchAccess(serial.getBranchId());
        return historyRepository.findBySerialIdOrderByCreatedAtDesc(serialId).stream()
                .map(ProductSerialHistoryDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductSerialDto> listSerials(Long branchId, SerialStatus status, int page, int pageSize, String sort) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = PageRequestFactory.of(page, pageSize, sort, SERIAL_SORTS, "importDate,desc");
        if (status == null) {
            return PageResponse.from(serialRepository
                    .findByBranchId(scopedBranchId, pageRequest)
                    .map(ProductSerialDto::from));
        }
        return PageResponse.from(serialRepository
                .findByBranchIdAndStatus(scopedBranchId, status, pageRequest)
                .map(ProductSerialDto::from));
    }

    @Transactional(readOnly = true)
    public List<PricingDtos.ProductPriceHistoryResponse> priceHistory(Long productId) {
        get(productId);
        return priceHistoryRepository.findByProductIdOrderByChangedAtDesc(productId).stream()
                .map(PricingDtos.ProductPriceHistoryResponse::from)
                .toList();
    }

    public Product get(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    private void apply(Product product, ProductDto request) {
        if (request.salePrice().compareTo(request.importPrice()) < 0) {
            throw new BusinessException("Sale price cannot be lower than import price");
        }
        product.setProductCode(request.productCode());
        product.setProductName(request.productName());
        product.setCategory(request.category());
        product.setBrand(request.brand());
        product.setModel(request.model());
        product.setColor(request.color());
        product.setBatteryCapacity(request.batteryCapacity());
        product.setMotorPower(request.motorPower());
        product.setImportPrice(request.importPrice());
        product.setSalePrice(request.salePrice());
        product.setWarrantyMonths(request.warrantyMonths());
        product.setStatus(request.status() == null ? RecordStatus.ACTIVE : request.status());
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream().anyMatch(item -> authority.equals(item.getAuthority()));
    }
}
