package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String productCode;

    @Column(nullable = false, length = 180)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductCategory category;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(length = 80)
    private String model;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes = new HashMap<>();

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal importPrice;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false)
    private int warrantyMonths;

    @Column(length = 50)
    private String taxReduction; // Giảm thuế theo quy định

    @Column(length = 50)
    private String productType; // Tính chất (Hàng hóa, Dịch vụ)

    @Column(length = 100)
    private String productGroup; // Nhóm VTHH

    @Column(length = 50)
    private String primaryUnit; // Đơn vị tính chính

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "default_warehouse_id")
    private Warehouse defaultWarehouse;

    @Column(length = 20)
    private String inventoryAccount; // TK Kho (1561)

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 14, scale = 2)
    private BigDecimal minStockQuantity = BigDecimal.ZERO;

    @Column(length = 30)
    private String productNature = "GOODS";

    @Column(length = 10)
    private String taxReductionCode;

    @Column(length = 20)
    private String inventoryAccountCode = "156";

    @Column(length = 20)
    private String costingMethod = "AVERAGE_COST";

    @Column(precision = 14, scale = 3)
    private BigDecimal minQuantity = BigDecimal.ZERO;

    @Column(precision = 14, scale = 3)
    private BigDecimal maxQuantity = BigDecimal.ZERO;

    @Column
    private Integer leadTimeDays = 0;

    @Column
    private Boolean isTracked = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status = RecordStatus.ACTIVE;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(length = 100)
    private String origin;

    @Column(columnDefinition = "TEXT")
    private String purchaseDescription;

    @Column(columnDefinition = "TEXT")
    private String salesDescription;

    @Column(length = 100)
    private String specialItemType;

    @Column(length = 50)
    private String warrantyPeriod;

    @Column(precision = 14, scale = 2)
    private BigDecimal inventoryStockQuantity = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal inventoryStockValue = BigDecimal.ZERO;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private boolean isService = false;

    @Column(nullable = false)
    private boolean taxReductionAllowed = false;

    @OneToMany(mappedBy = "comboProduct", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductComboItem> comboItems = new ArrayList<>();

    public Long getId() { return id; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
    public BigDecimal getImportPrice() { return importPrice; }
    public void setImportPrice(BigDecimal importPrice) { this.importPrice = importPrice; }
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public int getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(int warrantyMonths) { this.warrantyMonths = warrantyMonths; }
    public String getTaxReduction() { return taxReduction; }
    public void setTaxReduction(String taxReduction) { this.taxReduction = taxReduction; }
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    public String getProductGroup() { return productGroup; }
    public void setProductGroup(String productGroup) { this.productGroup = productGroup; }
    public String getPrimaryUnit() { return primaryUnit; }
    public void setPrimaryUnit(String primaryUnit) { this.primaryUnit = primaryUnit; }
    public Warehouse getDefaultWarehouse() { return defaultWarehouse; }
    public void setDefaultWarehouse(Warehouse defaultWarehouse) { this.defaultWarehouse = defaultWarehouse; }
    public String getInventoryAccount() { return inventoryAccount; }
    public void setInventoryAccount(String inventoryAccount) { this.inventoryAccount = inventoryAccount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getMinStockQuantity() { return minStockQuantity; }
    public void setMinStockQuantity(BigDecimal minStockQuantity) { this.minStockQuantity = minStockQuantity; }
    public RecordStatus getStatus() { return status; }
    public void setStatus(RecordStatus status) { this.status = status; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getPurchaseDescription() { return purchaseDescription; }
    public void setPurchaseDescription(String purchaseDescription) { this.purchaseDescription = purchaseDescription; }

    public String getSalesDescription() { return salesDescription; }
    public void setSalesDescription(String salesDescription) { this.salesDescription = salesDescription; }

    public String getSpecialItemType() { return specialItemType; }
    public void setSpecialItemType(String specialItemType) { this.specialItemType = specialItemType; }

    public String getWarrantyPeriod() { return warrantyPeriod; }
    public void setWarrantyPeriod(String warrantyPeriod) { this.warrantyPeriod = warrantyPeriod; }

    public List<ProductComboItem> getComboItems() { return comboItems; }
    public void setComboItems(List<ProductComboItem> comboItems) { this.comboItems = comboItems; }

    public BigDecimal getInventoryStockQuantity() { return inventoryStockQuantity; }
    public void setInventoryStockQuantity(BigDecimal inventoryStockQuantity) { this.inventoryStockQuantity = inventoryStockQuantity; }

    public BigDecimal getInventoryStockValue() { return inventoryStockValue; }
    public void setInventoryStockValue(BigDecimal inventoryStockValue) { this.inventoryStockValue = inventoryStockValue; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isService() { return isService; }
    public void setService(boolean isService) { this.isService = isService; }

    public boolean isTaxReductionAllowed() { return taxReductionAllowed; }
    public void setTaxReductionAllowed(boolean taxReductionAllowed) { this.taxReductionAllowed = taxReductionAllowed; }

    public String getProductNature() { return productNature; }
    public void setProductNature(String productNature) { this.productNature = productNature; }

    public String getTaxReductionCode() { return taxReductionCode; }
    public void setTaxReductionCode(String taxReductionCode) { this.taxReductionCode = taxReductionCode; }

    public String getInventoryAccountCode() { return inventoryAccountCode; }
    public void setInventoryAccountCode(String inventoryAccountCode) { this.inventoryAccountCode = inventoryAccountCode; }

    public String getCostingMethod() { return costingMethod; }
    public void setCostingMethod(String costingMethod) { this.costingMethod = costingMethod; }

    public BigDecimal getMinQuantity() { return minQuantity; }
    public void setMinQuantity(BigDecimal minQuantity) { this.minQuantity = minQuantity; }

    public BigDecimal getMaxQuantity() { return maxQuantity; }
    public void setMaxQuantity(BigDecimal maxQuantity) { this.maxQuantity = maxQuantity; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public Boolean getIsTracked() { return isTracked; }
    public void setIsTracked(Boolean isTracked) { this.isTracked = isTracked; }
}
