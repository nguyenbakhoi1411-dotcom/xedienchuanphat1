package com.chuanphat.warranty.service;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.dto.CreateWarrantyRequest;
import com.chuanphat.warranty.dto.ServiceProfessionalDtos;
import com.chuanphat.warranty.dto.WarrantyResponse;
import com.chuanphat.warranty.entity.WarrantyComponent;
import com.chuanphat.warranty.entity.WarrantyPolicy;
import com.chuanphat.warranty.entity.WarrantyPolicyDetail;
import com.chuanphat.warranty.entity.Warranty;
import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.WarrantyStatus;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.repository.WarrantyComponentRepository;
import com.chuanphat.warranty.repository.WarrantyPolicyDetailRepository;
import com.chuanphat.warranty.repository.WarrantyRepository;
import com.chuanphat.warranty.repository.WarrantyPolicyRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WarrantyService {
    private final WarrantyRepository warrantyRepository;
    private final WarrantyPolicyRepository policyRepository;
    private final WarrantyPolicyDetailRepository policyDetailRepository;
    private final WarrantyComponentRepository componentRepository;
    private final ProductSerialRepository serialRepository;
    private final BranchSecurity branchSecurity;

    public WarrantyService(
            WarrantyRepository warrantyRepository,
            WarrantyPolicyRepository policyRepository,
            WarrantyPolicyDetailRepository policyDetailRepository,
            WarrantyComponentRepository componentRepository,
            ProductSerialRepository serialRepository,
            BranchSecurity branchSecurity
    ) {
        this.warrantyRepository = warrantyRepository;
        this.policyRepository = policyRepository;
        this.policyDetailRepository = policyDetailRepository;
        this.componentRepository = componentRepository;
        this.serialRepository = serialRepository;
        this.branchSecurity = branchSecurity;
    }

    @Transactional
    public WarrantyResponse create(CreateWarrantyRequest request) {
        ProductSerial serial = serialRepository.findById(request.vehicleId())
                .orElseThrow(() -> new NotFoundException("Serial not found: " + request.vehicleId()));
        branchSecurity.requireBranchAccess(serial.getBranchId());
        if (!serial.getSerialNumber().equalsIgnoreCase(request.serialNumber())) {
            throw new BusinessException("Warranty serial does not match vehicle");
        }
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessException("Warranty endDate must be on or after startDate");
        }
        if (warrantyRepository.existsBySerialNumber(request.serialNumber())) {
            throw new BusinessException("Warranty already exists for serial " + request.serialNumber());
        }

        Warranty warranty = new Warranty();
        warranty.setSerialNumber(request.serialNumber());
        warranty.setVehicleId(request.vehicleId());
        warranty.setPolicyId(request.policyId());
        warranty.setCustomerId(request.customerId());
        warranty.setCustomerName(request.customerName());
        warranty.setInvoiceNo(request.invoiceNo());
        warranty.setPurchaseDate(request.purchaseDate());
        warranty.setStartDate(request.startDate());
        warranty.setEndDate(request.endDate());
        warranty.setBatteryEndDate(request.batteryEndDate());
        warranty.setMotorEndDate(request.motorEndDate());
        warranty.setChargerEndDate(request.chargerEndDate());
        warranty.setMainPartsWarranty(request.mainPartsWarranty());
        warranty.setStatus(WarrantyStatus.ACTIVE);

        Warranty saved = warrantyRepository.save(warranty);
        List<WarrantyComponent> components = activateComponents(saved, serial);
        return WarrantyResponse.from(saved, isValid(saved), componentResponses(components));
    }

    @Transactional(readOnly = true)
    public WarrantyResponse checkBySerial(String serialNumber) {
        ProductSerial serial = serialRepository.findBySerialNumberIgnoreCase(serialNumber)
                .orElseThrow(() -> new NotFoundException("Serial not found: " + serialNumber));
        branchSecurity.requireBranchAccess(serial.getBranchId());
        Warranty warranty = warrantyRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new NotFoundException("Warranty not found for serial " + serialNumber));
        return WarrantyResponse.from(warranty, isValid(warranty), componentResponses(componentRepository.findByWarrantyIdOrderByComponentType(warranty.getId())));
    }

    @Transactional(readOnly = true)
    public List<ServiceProfessionalDtos.WarrantyPolicyResponse> policies() {
        return policyRepository.findAll().stream()
                .map(policy -> ServiceProfessionalDtos.WarrantyPolicyResponse.from(policy, policyDetailRepository.findByPolicyIdOrderByComponentType(policy.getId())))
                .toList();
    }

    @Transactional
    public ServiceProfessionalDtos.WarrantyPolicyResponse createPolicy(ServiceProfessionalDtos.WarrantyPolicyRequest request) {
        WarrantyPolicy policy = new WarrantyPolicy();
        policy.setPolicyName(request.policyName());
        policy.setProductCategory(request.productCategory());
        policy.setWarrantyMonths(request.warrantyMonths());
        policy.setBatteryWarrantyMonths(request.batteryWarrantyMonths());
        policy.setMotorWarrantyMonths(request.motorWarrantyMonths());
        policy.setIncludedParts(request.includedParts());
        policy.setExcludedCases(request.excludedCases());
        policy.setLaborFeePolicy(request.laborFeePolicy());
        WarrantyPolicy saved = policyRepository.save(policy);
        List<WarrantyPolicyDetail> details = request.details() == null ? List.of() : request.details().stream().map(detailRequest -> {
            WarrantyPolicyDetail detail = new WarrantyPolicyDetail();
            detail.setPolicyId(saved.getId());
            detail.setProductId(detailRequest.productId());
            detail.setComponentType(detailRequest.componentType());
            detail.setWarrantyMonths(detailRequest.warrantyMonths());
            detail.setWarrantyKm(detailRequest.warrantyKm());
            detail.setConditions(detailRequest.conditions());
            detail.setExclusions(detailRequest.exclusions());
            return policyDetailRepository.save(detail);
        }).toList();
        return ServiceProfessionalDtos.WarrantyPolicyResponse.from(saved, details);
    }

    @Transactional(readOnly = true)
    public boolean isComponentCovered(Long serialId, ComponentType componentType, LocalDate serviceDate) {
        if (componentType == null) {
            return false;
        }
        LocalDate actualDate = serviceDate == null ? LocalDate.now() : serviceDate;
        return componentRepository.findFirstBySerialIdAndComponentTypeOrderByEndDateDesc(serialId, componentType)
                .filter(component -> component.getStatus() == WarrantyStatus.ACTIVE)
                .filter(component -> !actualDate.isBefore(component.getStartDate()) && !actualDate.isAfter(component.getEndDate()))
                .isPresent();
    }

    private boolean isValid(Warranty warranty) {
        LocalDate today = LocalDate.now();
        return warranty.getStatus() == WarrantyStatus.ACTIVE
                && !today.isBefore(warranty.getStartDate())
                && !today.isAfter(warranty.getEndDate());
    }

    private List<WarrantyComponent> activateComponents(Warranty warranty, ProductSerial serial) {
        List<WarrantyPolicyDetail> details = warranty.getPolicyId() == null
                ? List.of()
                : policyDetailRepository.findByPolicyIdOrderByComponentType(warranty.getPolicyId()).stream()
                        .filter(detail -> detail.getProductId().equals(serial.getProduct().getId()))
                        .toList();
        if (details.isEmpty()) {
            details = policyDetailRepository.findByProductIdOrderByComponentType(serial.getProduct().getId());
        }
        if (details.isEmpty()) {
            details = defaultDetails(warranty, serial);
        }
        return details.stream().map(detail -> {
            WarrantyComponent component = new WarrantyComponent();
            component.setWarrantyId(warranty.getId());
            component.setProductId(serial.getProduct().getId());
            component.setSerialId(serial.getId());
            component.setCustomerId(warranty.getCustomerId());
            component.setComponentType(detail.getComponentType());
            component.setStartDate(warranty.getStartDate());
            component.setEndDate(warranty.getStartDate().plusMonths(detail.getWarrantyMonths()));
            component.setWarrantyKm(detail.getWarrantyKm());
            component.setConditions(detail.getConditions());
            component.setExclusions(detail.getExclusions());
            return componentRepository.save(component);
        }).toList();
    }

    private List<WarrantyPolicyDetail> defaultDetails(Warranty warranty, ProductSerial serial) {
        int months = Math.max(serial.getProduct().getWarrantyMonths(), 0);
        if (months == 0) {
            months = Math.max(1, (int) java.time.temporal.ChronoUnit.MONTHS.between(warranty.getStartDate(), warranty.getEndDate()));
        }
        final int warrantyMonths = months;
        return Arrays.stream(ComponentType.values()).map(componentType -> {
            WarrantyPolicyDetail detail = new WarrantyPolicyDetail();
            detail.setProductId(serial.getProduct().getId());
            detail.setComponentType(componentType);
            detail.setWarrantyMonths(warrantyMonths);
            detail.setConditions(warranty.getMainPartsWarranty());
            return detail;
        }).toList();
    }

    private List<ServiceProfessionalDtos.WarrantyComponentResponse> componentResponses(List<WarrantyComponent> components) {
        LocalDate today = LocalDate.now();
        return components.stream()
                .map(component -> ServiceProfessionalDtos.WarrantyComponentResponse.from(component,
                        component.getStatus() == WarrantyStatus.ACTIVE
                                && !today.isBefore(component.getStartDate())
                                && !today.isAfter(component.getEndDate())))
                .toList();
    }
}
