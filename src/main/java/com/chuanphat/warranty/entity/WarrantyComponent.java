package com.chuanphat.warranty.entity;

import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.WarrantyStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "warranty_components")
public class WarrantyComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long warrantyId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Long serialId;

    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ComponentType componentType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private Integer warrantyKm;

    @Column(length = 1000)
    private String conditions;

    @Column(length = 1000)
    private String exclusions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WarrantyStatus status = WarrantyStatus.ACTIVE;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public Long getWarrantyId() { return warrantyId; }
    public void setWarrantyId(Long warrantyId) { this.warrantyId = warrantyId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getSerialId() { return serialId; }
    public void setSerialId(Long serialId) { this.serialId = serialId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public ComponentType getComponentType() { return componentType; }
    public void setComponentType(ComponentType componentType) { this.componentType = componentType; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getWarrantyKm() { return warrantyKm; }
    public void setWarrantyKm(Integer warrantyKm) { this.warrantyKm = warrantyKm; }
    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }
    public String getExclusions() { return exclusions; }
    public void setExclusions(String exclusions) { this.exclusions = exclusions; }
    public WarrantyStatus getStatus() { return status; }
    public void setStatus(WarrantyStatus status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
