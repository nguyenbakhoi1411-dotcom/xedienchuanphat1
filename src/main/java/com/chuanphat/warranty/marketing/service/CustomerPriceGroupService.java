package com.chuanphat.warranty.marketing.service;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.marketing.dto.CustomerPriceGroupDTO;
import com.chuanphat.warranty.marketing.entity.CustomerPriceGroup;
import com.chuanphat.warranty.marketing.entity.PriceList;
import com.chuanphat.warranty.marketing.enums.CustomerGroupStatus;
import com.chuanphat.warranty.marketing.repository.CustomerPriceGroupRepository;
import com.chuanphat.warranty.marketing.repository.PriceListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


@Service
@RequiredArgsConstructor
public class CustomerPriceGroupService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CustomerPriceGroupService.class);

    private final CustomerPriceGroupRepository customerPriceGroupRepository;
    private final PriceListRepository priceListRepository;
    private final CustomerRepository customerRepository;
    private final SalesOrderRepository salesOrderRepository;

    @Transactional(readOnly = true)
    public List<CustomerPriceGroup> getAllGroups() {
        return customerPriceGroupRepository.findAll();
    }

    @Transactional
    public CustomerPriceGroup createGroup(CustomerPriceGroupDTO dto) {
        PriceList priceList = priceListRepository.findById(dto.getPriceListId())
                .orElseThrow(() -> new RuntimeException("Price List not found"));

        CustomerPriceGroup group = CustomerPriceGroup.builder()
                .maNhomGia(dto.getMaNhomGia())
                .tenNhomGia(dto.getTenNhomGia())
                .priceList(priceList)
                .dieuKienMinOrder(dto.getDieuKienMinOrder() != null ? dto.getDieuKienMinOrder() : BigDecimal.ZERO)
                .dieuKienMinCum(dto.getDieuKienMinCum() != null ? dto.getDieuKienMinCum() : BigDecimal.ZERO)
                .mauSac(dto.getMauSac())
                .moTa(dto.getMoTa())
                .build();

        return customerPriceGroupRepository.save(group);
    }

    @Transactional
    public void assignCustomers(Long groupId, List<Long> customerIds) {
        CustomerPriceGroup group = customerPriceGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<Customer> customers = customerRepository.findAllById(customerIds);
        for (Customer c : customers) {
            c.setCustomerPriceGroupId(group.getId());
        }
        customerRepository.saveAll(customers);
    }

    @Transactional
    public void recalculateHistoricalPurchases() {
        log.info("Starting historical recalculation of total purchases...");
        List<Customer> customers = customerRepository.findAll();
        for (Customer customer : customers) {
            List<SalesOrder> orders = salesOrderRepository.findByCustomerIdAndStatus(customer.getId(), SalesOrderStatus.DELIVERED);
            BigDecimal total = orders.stream()
                    .map(SalesOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            customer.setTotalPurchaseAmount(total);
        }
        customerRepository.saveAll(customers);
        log.info("Recalculation finished for {} customers", customers.size());
    }

    @Transactional
    public int autoClassifyCustomers() {
        List<CustomerPriceGroup> groups = customerPriceGroupRepository.findByTrangThaiOrderByDieuKienMinCumDesc(CustomerGroupStatus.ACTIVE);
        if (groups.isEmpty()) return 0;

        List<Customer> customers = customerRepository.findAll();
        int changedCount = 0;

        for (Customer customer : customers) {
            BigDecimal totalCum = customer.getTotalPurchaseAmount() != null ? customer.getTotalPurchaseAmount() : BigDecimal.ZERO;
            Long currentGroupId = customer.getCustomerPriceGroupId();
            
            // Find highest eligible group
            CustomerPriceGroup targetGroup = null;
            for (CustomerPriceGroup group : groups) {
                if (group.getDieuKienMinCum().compareTo(BigDecimal.ZERO) > 0 && totalCum.compareTo(group.getDieuKienMinCum()) >= 0) {
                    targetGroup = group;
                    break;
                }
            }
            
            if (targetGroup != null) {
                if (currentGroupId == null || !currentGroupId.equals(targetGroup.getId())) {
                    customer.setCustomerPriceGroupId(targetGroup.getId());
                    changedCount++;
                }
            }
        }
        
        if (changedCount > 0) {
            customerRepository.saveAll(customers);
        }
        return changedCount;
    }
}

