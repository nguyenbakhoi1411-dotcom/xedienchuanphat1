package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.CustomerDto;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.crm.enums.CustomerTier;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final BranchSecurity branchSecurity;
    private final SalesOrderRepository salesOrderRepository;

    public CustomerService(CustomerRepository customerRepository, BranchSecurity branchSecurity,
                           SalesOrderRepository salesOrderRepository) {
        this.customerRepository = customerRepository;
        this.branchSecurity = branchSecurity;
        this.salesOrderRepository = salesOrderRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<CustomerDto> list(String keyword, Long branchId, int page, int pageSize) {
        String search = keyword == null ? "" : keyword;
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            return PageResponse.from(customerRepository
                    .findByStatusNotAndFullNameContainingIgnoreCase(RecordStatus.DELETED, search, PageRequest.of(page, pageSize))
                    .map(CustomerDto::from));
        }
        return PageResponse.from(customerRepository
                .findByStatusNotAndBranchIdAndFullNameContainingIgnoreCase(RecordStatus.DELETED, scopedBranchId, search, PageRequest.of(page, pageSize))
                .map(CustomerDto::from));
    }

    @Transactional
    public CustomerDto create(CustomerDto request) {
        branchSecurity.requireBranchAccess(request.branchId());
        if (customerRepository.existsByPhone(request.phone())) {
            throw new BusinessException("Customer phone already exists");
        }
        Customer customer = new Customer();
        apply(customer, request);
        return CustomerDto.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDto update(Long id, CustomerDto request) {
        Customer customer = get(id);
        branchSecurity.requireBranchAccess(customer.getBranchId());
        branchSecurity.requireBranchAccess(request.branchId());
        apply(customer, request);
        return CustomerDto.from(customerRepository.save(customer));
    }

    public Customer get(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> new NotFoundException("Customer not found: " + id));
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = get(id);
        branchSecurity.requireBranchAccess(customer.getBranchId());
        if (salesOrderRepository.countByCustomerId(id) > 0) {
            throw new BusinessException("Cannot delete customer with existing sales orders");
        }
        customer.setStatus(RecordStatus.DELETED);
        customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public java.util.List<CustomerDto> searchSimple(String keyword) {
        Long scopedBranchId = branchSecurity.scopedBranchId(null, false);
        String search = keyword == null ? "" : keyword;
        PageRequest limit = PageRequest.of(0, 10);
        if (scopedBranchId == null) {
            return customerRepository.findByStatusNotAndFullNameContainingIgnoreCase(RecordStatus.DELETED, search, limit)
                    .map(CustomerDto::from).toList();
        }
        return customerRepository.findByStatusNotAndBranchIdAndFullNameContainingIgnoreCase(RecordStatus.DELETED, scopedBranchId, search, limit)
                .map(CustomerDto::from).toList();
    }

    // ── Customer 360 ──

    /**
     * Cập nhật ngày dịch vụ cuối cùng của khách hàng.
     * Gọi từ ServiceTicketService khi phiếu COMPLETED.
     */
    @Transactional
    public void updateLastServiceDate(Long customerId, LocalDate date) {
        customerRepository.findById(customerId).ifPresent(customer -> {
            if (customer.getLastServiceDate() == null || date.isAfter(customer.getLastServiceDate())) {
                customer.setLastServiceDate(date);
            }
        });
    }

    /**
     * Cập nhật ngày mua hàng gần nhất, tổng doanh thu và số lần mua.
     * Gọi từ SalesService khi đơn hàng DELIVERED.
     */
    @Transactional
    public void recordPurchase(Long customerId, BigDecimal amount, LocalDate purchaseDate) {
        customerRepository.findById(customerId).ifPresent(customer -> {
            customer.setTotalPurchaseCount(customer.getTotalPurchaseCount() + 1);
            customer.setTotalPurchaseAmount(customer.getTotalPurchaseAmount().add(amount));
            customer.setLifetimeValue(customer.getLifetimeValue().add(amount));
            if (customer.getLastPurchaseDate() == null || purchaseDate.isAfter(customer.getLastPurchaseDate())) {
                customer.setLastPurchaseDate(purchaseDate);
            }
            // Tự động nâng hạng dựa trên Lifetime Value
            recalculateTierFromStats(customer);
        });
    }

    /**
     * Tính lại tier dựa trên lifetime value.
     * NEW < 5tr | REGULAR < 20tr | VIP < 50tr | PLATINUM >= 50tr
     */
    private void recalculateTierFromStats(Customer customer) {
        BigDecimal ltv = customer.getLifetimeValue();
        CustomerTier newTier;
        if (ltv.compareTo(BigDecimal.valueOf(50_000_000)) >= 0) {
            newTier = CustomerTier.PLATINUM;
        } else if (ltv.compareTo(BigDecimal.valueOf(20_000_000)) >= 0) {
            newTier = CustomerTier.VIP;
        } else if (ltv.compareTo(BigDecimal.valueOf(5_000_000)) >= 0) {
            newTier = CustomerTier.REGULAR;
        } else {
            newTier = CustomerTier.NEW;
        }
        // Chỉ nâng hạng, không hạ hạng tự động
        if (newTier.ordinal() > customer.getTier().ordinal()) {
            customer.setTier(newTier);
        }
    }

    private void apply(Customer customer, CustomerDto request) {
        customer.setPhone(request.phone());
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setAddress(request.address());
        customer.setSource(request.source());
        customer.setBranchId(request.branchId());
        customer.setAssignedTo(request.assignedTo());
        customer.setBirthday(request.birthday());
        customer.setTier(request.tier() == null ? CustomerTier.NEW : request.tier());
        customer.setStatus(request.status() == null ? RecordStatus.ACTIVE : request.status());

        customer.setOrganization(request.isOrganization());
        customer.setSupplier(request.isSupplier());
        customer.setInternal(request.isInternal());
        customer.setTaxUnitCode(request.taxUnitCode());
        customer.setWebsite(request.website());
        customer.setCustomerGroup(request.customerGroup());
        customer.setSalesEmployee(request.salesEmployee());
        customer.setContactTitle(request.contactTitle());
        customer.setContactName(request.contactName());
        customer.setContactEmail(request.contactEmail());
        customer.setContactMobilePhone(request.contactMobilePhone());
        customer.setLegalRepresentative(request.legalRepresentative());
        customer.setInvoiceRecipientName(request.invoiceRecipientName());
        customer.setInvoiceRecipientEmail(request.invoiceRecipientEmail());
        customer.setInvoiceRecipientPhone(request.invoiceRecipientPhone());
        customer.setBankAccountNumber(request.bankAccountNumber());
        customer.setBankName(request.bankName());
        customer.setBankBranch(request.bankBranch());
    }
}
