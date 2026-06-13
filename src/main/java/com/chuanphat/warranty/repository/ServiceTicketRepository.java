package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.ServiceTicket;
import com.chuanphat.warranty.enums.ServiceTicketStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {
    List<ServiceTicket> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    Page<ServiceTicket> findByStatus(ServiceTicketStatus status, Pageable pageable);

    List<ServiceTicket> findByCustomerNameContainingIgnoreCaseOrderByCreatedAtDesc(String customerName);

    @Query("select ticket.status as status, count(ticket) as total from ServiceTicket ticket group by ticket.status")
    List<StatusCountRow> countByStatusGroup();

    @Query("select ticket.issueDescription as issue, count(ticket) as total from ServiceTicket ticket group by ticket.issueDescription order by count(ticket) desc")
    List<IssueCountRow> commonIssues();

    @Query("select ticket.technicianUsername as technicianUsername, count(ticket) as total from ServiceTicket ticket where ticket.technicianUsername is not null group by ticket.technicianUsername order by count(ticket) desc")
    List<TechnicianCountRow> topTechnicians();

    @Query("select coalesce(sum(ticket.warrantyCost), 0) from ServiceTicket ticket")
    BigDecimal totalWarrantyCost();

    @Query("select coalesce(sum(ticket.totalCost), 0) from ServiceTicket ticket where ticket.warrantyRepair = false")
    BigDecimal totalPaidRepairRevenue();

    long countByTechnicianUsernameAndCreatedAtBetween(String technicianUsername, OffsetDateTime from, OffsetDateTime to);

    @Query("""
            select ticket from ServiceTicket ticket
            where (:status is null or ticket.status = :status)
              and (:branchId is null or ticket.branchId = :branchId or exists (
                  select 1 from ProductSerial serial
                  where serial.id = ticket.vehicleId and serial.branchId = :branchId
              ))
              and (
                  :keyword is null
                  or lower(ticket.customerName) like lower(concat('%', :keyword, '%'))
                  or lower(ticket.serialNumber) like lower(concat('%', :keyword, '%'))
                  or lower(ticket.issueDescription) like lower(concat('%', :keyword, '%'))
                  or lower(ticket.customerPhone) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<ServiceTicket> search(Long branchId, ServiceTicketStatus status, String keyword, Pageable pageable);

    interface StatusCountRow {
        ServiceTicketStatus getStatus();
        long getTotal();
    }

    interface IssueCountRow {
        String getIssue();
        long getTotal();
    }

    interface TechnicianCountRow {
        String getTechnicianUsername();
        long getTotal();
    }
}
