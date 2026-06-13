package com.chuanphat.warranty.entity;

import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.ServiceTicketItemType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "service_ticket_items")
public class ServiceTicketItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ServiceTicket ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceTicketItemType type;

    @Column(nullable = false, length = 120)
    private String name;

    private Long productId;

    private Long warehouseId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean warrantyCovered;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ComponentType componentType;

    public Long getId() {
        return id;
    }

    public ServiceTicket getTicket() {
        return ticket;
    }

    public void setTicket(ServiceTicket ticket) {
        this.ticket = ticket;
    }

    public ServiceTicketItemType getType() {
        return type;
    }

    public void setType(ServiceTicketItemType type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getProductId() { return productId; }

    public void setProductId(Long productId) { this.productId = productId; }

    public Long getWarehouseId() { return warehouseId; }

    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getUnitCost() { return unitCost; }

    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost == null ? BigDecimal.ZERO : unitCost; }

    public boolean isWarrantyCovered() { return warrantyCovered; }

    public void setWarrantyCovered(boolean warrantyCovered) { this.warrantyCovered = warrantyCovered; }

    public ComponentType getComponentType() { return componentType; }

    public void setComponentType(ComponentType componentType) { this.componentType = componentType; }

    public BigDecimal lineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal costTotal() {
        return unitCost.multiply(BigDecimal.valueOf(quantity));
    }
}
