package com.chuanphat.warranty.crm;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.DepositRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.QuotationRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesPaymentRepository;
import com.chuanphat.warranty.crm.dto.CrmDtos;
import com.chuanphat.warranty.crm.entity.Lead;
import com.chuanphat.warranty.crm.enums.CustomerRank;
import com.chuanphat.warranty.crm.enums.CustomerTier;
import com.chuanphat.warranty.crm.enums.LeadSource;
import com.chuanphat.warranty.crm.enums.LeadStatus;
import com.chuanphat.warranty.crm.repository.CrmCareTaskRepository;
import com.chuanphat.warranty.crm.repository.CustomerCareNoteRepository;
import com.chuanphat.warranty.crm.repository.CustomerGroupRepository;
import com.chuanphat.warranty.crm.repository.LeadRepository;
import com.chuanphat.warranty.crm.repository.SalesOpportunityRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.repository.ServiceTicketRepository;
import com.chuanphat.warranty.repository.WarrantyRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CrmServiceBusinessTest {
    @Mock CustomerRepository customerRepository;
    @Mock SalesOrderRepository salesOrderRepository;
    @Mock SalesPaymentRepository salesPaymentRepository;
    @Mock WarrantyRepository warrantyRepository;
    @Mock ServiceTicketRepository serviceTicketRepository;
    @Mock LeadRepository leadRepository;
    @Mock SalesOpportunityRepository opportunityRepository;
    @Mock CrmCareTaskRepository taskRepository;
    @Mock CustomerCareNoteRepository noteRepository;
    @Mock ProductSerialRepository serialRepository;
    @Mock QuotationRepository quotationRepository;
    @Mock DepositRepository depositRepository;
    @Mock CustomerGroupRepository customerGroupRepository;
    @Mock CrmAlertService alertService;

    CrmService service;

    @BeforeEach
    void setUp() {
        service = new CrmService(customerRepository, salesOrderRepository, salesPaymentRepository, warrantyRepository,
                serviceTicketRepository, leadRepository, opportunityRepository, taskRepository, noteRepository,
                serialRepository, quotationRepository, depositRepository, customerGroupRepository, alertService, new BigDecimal("30000000"));
    }

    @Test
    void createsLeadAndMovesThroughAllowedStatuses() {
        when(leadRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var created = service.createLead(new CrmDtos.LeadRequest("Nguyen Van A", "0900000001", "a@example.com", LeadSource.FACEBOOK, "CP-01", 10L, 1L, null, new BigDecimal("20000000"), null, null, "note"));
        assertThat(created.status()).isEqualTo(LeadStatus.NEW);

        Lead lead = lead(1L, LeadStatus.NEW);
        when(leadRepository.findById(1L)).thenReturn(Optional.of(lead));
        var contacted = service.advanceLead(1L, LeadStatus.CONTACTED, "called");
        assertThat(contacted.status()).isEqualTo(LeadStatus.CONTACTED);

        lead.setStatus(LeadStatus.WON);
        assertThatThrownBy(() -> service.advanceLead(1L, LeadStatus.LOST, "duplicate"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void convertLeadCreatesCustomer360WithCoreSections() {
        Lead lead = lead(1L, LeadStatus.QUOTED);
        when(leadRepository.findById(1L)).thenReturn(Optional.of(lead));
        when(customerRepository.count()).thenReturn(0L);
        when(customerRepository.save(any())).thenAnswer(invocation -> withId(invocation.getArgument(0), 100L));
        when(leadRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(customerRepository.findById(100L)).thenReturn(Optional.of(customer(100L)));
        when(salesOrderRepository.findByCustomerIdOrderByOrderDateDesc(100L)).thenReturn(List.of());
        when(serialRepository.findByCurrentCustomerIdOrderBySoldDateDesc(100L)).thenReturn(List.of());
        when(quotationRepository.findByCustomerIdOrderByQuotationDateDesc(100L)).thenReturn(List.of());
        when(depositRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(100L)).thenReturn(List.of());
        when(warrantyRepository.findByCustomerIdOrderByEndDateAsc(100L)).thenReturn(List.of());
        when(serviceTicketRepository.findByCustomerNameContainingIgnoreCaseOrderByCreatedAtDesc("Nguyen Van A")).thenReturn(List.of());
        when(noteRepository.findByCustomerIdOrderByCreatedAtDesc(100L)).thenReturn(List.of());
        when(taskRepository.findByCustomerIdOrderByDueDateAscCreatedAtDesc(100L)).thenReturn(List.of());
        when(opportunityRepository.findByCustomerIdOrderByCreatedAtDesc(100L)).thenReturn(List.of());
        when(salesPaymentRepository.findByOrder_CustomerIdOrderByPaymentDateDescIdDesc(100L)).thenReturn(List.of());
        when(alertService.getAlertsByCustomer(100L)).thenReturn(List.of());

        var customer360 = service.convertLeadToCustomer(1L, new CrmDtos.ConvertLeadRequest(1L, 10L, "a@example.com", "Go Vap"));

        assertThat(customer360.id()).isEqualTo(100L);
        assertThat(customer360.purchases()).isEmpty();
        assertThat(customer360.warranties()).isEmpty();
        assertThat(customer360.vehicles()).isEmpty();
        assertThat(lead.getStatus()).isEqualTo(LeadStatus.CONVERTED);
    }

    private Lead lead(Long id, LeadStatus status) {
        Lead lead = withId(new Lead(), id);
        lead.setLeadName("Nguyen Van A");
        lead.setPhone("0900000001");
        lead.setEmail("a@example.com");
        lead.setSource(LeadSource.FACEBOOK);
        lead.setBranchId(1L);
        lead.setAssignedTo(10L);
        lead.setStatus(status);
        return lead;
    }

    private Customer customer(Long id) {
        Customer customer = withId(new Customer(), id);
        customer.setCustomerCode("KH-000001");
        customer.setFullName("Nguyen Van A");
        customer.setPhone("0900000001");
        customer.setEmail("a@example.com");
        customer.setAddress("Go Vap");
        customer.setSource("FACEBOOK");
        customer.setBranchId(1L);
        customer.setAssignedTo(10L);
        customer.setTier(CustomerTier.NEW);
        customer.setRank(CustomerRank.NEW);
        com.chuanphat.warranty.BusinessCriticalTestSupport.setField(customer, "createdAt", OffsetDateTime.now());
        return customer;
    }
}
