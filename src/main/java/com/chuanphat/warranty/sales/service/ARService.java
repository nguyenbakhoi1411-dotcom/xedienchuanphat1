package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesPaymentRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ARService {
    private final CustomerRepository customerRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SalesPaymentRepository salesPaymentRepository;
    private final com.chuanphat.warranty.core.repository.CustomerDebtLedgerRepository debtLedgerRepository;

    public ARService(CustomerRepository customerRepository, SalesOrderRepository salesOrderRepository, SalesPaymentRepository salesPaymentRepository, com.chuanphat.warranty.core.repository.CustomerDebtLedgerRepository debtLedgerRepository) {
        this.customerRepository = customerRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.salesPaymentRepository = salesPaymentRepository;
        this.debtLedgerRepository = debtLedgerRepository;
    }

    public Map<String, Object> getSummary(Long branchId) {
        Map<String, Object> summary = new HashMap<>();
        
        java.math.BigDecimal totalReceivable = java.math.BigDecimal.ZERO;
        java.math.BigDecimal debt0to30 = java.math.BigDecimal.ZERO;
        java.math.BigDecimal debt30to60 = java.math.BigDecimal.ZERO;
        java.math.BigDecimal debt60Plus = java.math.BigDecimal.ZERO;
        
        // Fetch all and filter to avoid Repository method missing error
        java.util.List<com.chuanphat.warranty.core.entity.Customer> debtors = 
            customerRepository.findAll().stream().filter(c -> c.getBranchId() != null && c.getBranchId().equals(branchId)).collect(java.util.stream.Collectors.toList());
            
        java.time.LocalDate now = java.time.LocalDate.now();
        
        for (com.chuanphat.warranty.core.entity.Customer c : debtors) {
            if (c.getTotalDebt() != null && c.getTotalDebt().compareTo(java.math.BigDecimal.ZERO) > 0) {
                totalReceivable = totalReceivable.add(c.getTotalDebt());
                
                // Estimate aging based on lastPurchaseDate
                if (c.getLastPurchaseDate() != null) {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(c.getLastPurchaseDate(), now);
                    if (days <= 30) {
                        debt0to30 = debt0to30.add(c.getTotalDebt());
                    } else if (days <= 60) {
                        debt30to60 = debt30to60.add(c.getTotalDebt());
                    } else {
                        debt60Plus = debt60Plus.add(c.getTotalDebt());
                    }
                } else {
                    debt60Plus = debt60Plus.add(c.getTotalDebt());
                }
            }
        }
        
        summary.put("totalReceivable", totalReceivable);
        summary.put("aging0to30", debt0to30);
        summary.put("aging30to60", debt30to60);
        summary.put("aging60Plus", debt60Plus);
        summary.put("currency", "VND");
        
        return summary;
    }

    @org.springframework.transaction.annotation.Transactional
    public void recordDebtIncrease(Long customerId, java.math.BigDecimal amount, String refNo, String description) {
        com.chuanphat.warranty.core.entity.Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setTotalDebt(customer.getTotalDebt().add(amount));
        customerRepository.save(customer);

        com.chuanphat.warranty.core.entity.CustomerDebtLedger ledger = new com.chuanphat.warranty.core.entity.CustomerDebtLedger();
        ledger.setCustomer(customer);
        ledger.setTransactionDate(java.time.OffsetDateTime.now());
        ledger.setTransactionType("SALES_INVOICE");
        ledger.setReferenceNo(refNo);
        ledger.setIncreaseAmount(amount);
        ledger.setBalance(customer.getTotalDebt());
        ledger.setDescription(description);
        debtLedgerRepository.save(ledger);
    }

    @org.springframework.transaction.annotation.Transactional
    public void recordDebtDecrease(Long customerId, java.math.BigDecimal amount, String refNo, String description) {
        com.chuanphat.warranty.core.entity.Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setTotalDebt(customer.getTotalDebt().subtract(amount));
        customer.setRevenue30Days(customer.getRevenue30Days().add(amount));
        customerRepository.save(customer);

        com.chuanphat.warranty.core.entity.CustomerDebtLedger ledger = new com.chuanphat.warranty.core.entity.CustomerDebtLedger();
        ledger.setCustomer(customer);
        ledger.setTransactionDate(java.time.OffsetDateTime.now());
        ledger.setTransactionType("PAYMENT");
        ledger.setReferenceNo(refNo);
        ledger.setDecreaseAmount(amount); 
        ledger.setBalance(customer.getTotalDebt());
        ledger.setDescription(description);
        debtLedgerRepository.save(ledger);
    }
}
