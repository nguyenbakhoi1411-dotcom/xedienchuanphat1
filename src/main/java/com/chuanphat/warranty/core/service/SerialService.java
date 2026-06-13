package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.CreateSerialRequest;
import com.chuanphat.warranty.core.dto.ProductSerialDto;
import com.chuanphat.warranty.core.dto.ProductSerialHistoryDto;
import com.chuanphat.warranty.core.dto.TransferSerialRequest;
import com.chuanphat.warranty.core.dto.UpdateSerialStatusRequest;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.ProductSerialHistory;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialHistoryRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.ConflictException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * SerialService — Quan ly toan bo vong doi cua serial xe dien.
 *
 * Tat ca thay doi trang thai (status) deu duoc ghi vao ProductSerialHistory.
 * Cac rang buoc sau duoc kiem tra:
 *   - frameNumber phai unique
 *   - batterySerial phai unique
 *   - Serial SOLD khong the ban lai
 *   - Serial DEFECTIVE/DAMAGED khong the ban
 *   - Serial RESERVED chi ban cho dung khach da dat coc
 */
@Service
@Transactional
public class SerialService {

    private final ProductSerialRepository serialRepo;
    private final ProductSerialHistoryRepository historyRepo;
    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;
    private final BranchSecurity branchSecurity;

    public SerialService(
            ProductSerialRepository serialRepo,
            ProductSerialHistoryRepository historyRepo,
            ProductRepository productRepo,
            WarehouseRepository warehouseRepo,
            BranchSecurity branchSecurity
    ) {
        this.serialRepo = serialRepo;
        this.historyRepo = historyRepo;
        this.productRepo = productRepo;
        this.warehouseRepo = warehouseRepo;
        this.branchSecurity = branchSecurity;
    }

    // ──────────────────────────────────────────────
    // QUERY
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<ProductSerialDto> search(
            String keyword,
            Long branchId,
            Long warehouseId,
            Long productId,
            SerialStatus status,
            int page,
            int pageSize
    ) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = serialRepo.search(keyword, scopedBranchId, warehouseId, productId, status, pageable);
        var dtoPage = result.map(ProductSerialDto::from);
        return PageResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public ProductSerialDto get(Long id) {
        return ProductSerialDto.from(findById(id));
    }

    @Transactional(readOnly = true)
    public ProductSerialDto findByIdentifier(String identifier) {
        // Thu tim lan luot: serialNumber, frameNumber, engineNumber, batterySerial
        return serialRepo.findBySerialNumberIgnoreCase(identifier)
                .or(() -> serialRepo.findByFrameNumberIgnoreCase(identifier))
                .or(() -> serialRepo.findByEngineNumberIgnoreCase(identifier))
                .or(() -> serialRepo.findByBatterySerialIgnoreCase(identifier))
                .map(ProductSerialDto::from)
                .orElseThrow(() -> new BusinessException("Khong tim thay serial: " + identifier));
    }

    @Transactional(readOnly = true)
    public List<ProductSerialHistoryDto> getHistory(Long serialId) {
        findById(serialId); // validate ton tai
        return historyRepo.findBySerialIdOrderByCreatedAtDesc(serialId)
                .stream().map(ProductSerialHistoryDto::from).toList();
    }

    // ──────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────

    public ProductSerialDto create(CreateSerialRequest req) {
        // Kiem tra trung lap
        if (serialRepo.existsBySerialNumberIgnoreCase(req.serialNumber())) {
            throw new ConflictException("Serial number da ton tai: " + req.serialNumber());
        }
        if (req.frameNumber() != null && !req.frameNumber().isBlank()
                && serialRepo.existsByFrameNumberIgnoreCase(req.frameNumber())) {
            throw new ConflictException("So khung (frameNumber) da ton tai: " + req.frameNumber());
        }
        if (req.batterySerial() != null && !req.batterySerial().isBlank()
                && serialRepo.existsByBatterySerialIgnoreCase(req.batterySerial())) {
            throw new ConflictException("So pin (batterySerial) da ton tai: " + req.batterySerial());
        }
        if (req.engineNumber() != null && !req.engineNumber().isBlank()
                && serialRepo.existsByEngineNumberIgnoreCase(req.engineNumber())) {
            throw new ConflictException("So may (engineNumber) da ton tai: " + req.engineNumber());
        }

        Product product = productRepo.findById(req.productId())
                .orElseThrow(() -> new BusinessException("Khong tim thay san pham: " + req.productId()));

        ProductSerial serial = new ProductSerial();
        serial.setProduct(product);
        serial.setSerialNumber(req.serialNumber());
        serial.setBranchId(req.branchId());
        serial.setFrameNumber(req.frameNumber());
        serial.setEngineNumber(req.engineNumber());
        serial.setBatterySerial(req.batterySerial());
        serial.setMotorSerial(req.motorSerial());
        serial.setChargerNumber(req.chargerNumber());
        serial.setColor(req.color());
        serial.setVersion(req.version());
        serial.setImportDate(req.importDate() != null ? req.importDate() : LocalDate.now());
        serial.setSupplierId(req.supplierId());
        serial.setPurchaseCost(req.purchaseCost());
        serial.setNote(req.note());
        serial.setStatus(SerialStatus.IN_STOCK);

        if (req.warehouseId() != null) {
            Warehouse wh = warehouseRepo.findById(req.warehouseId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay kho: " + req.warehouseId()));
            serial.setWarehouse(wh);
        }

        ProductSerial saved = serialRepo.save(serial);

        // Ghi lich su
        recordHistory(saved, "IMPORTED", null, SerialStatus.IN_STOCK,
                "PURCHASE_RECEIPT", null, req.branchId(), req.branchId(), null, req.warehouseId());

        return ProductSerialDto.from(saved);
    }

    // ──────────────────────────────────────────────
    // STATUS UPDATE
    // ──────────────────────────────────────────────

    public ProductSerialDto updateStatus(Long id, UpdateSerialStatusRequest req) {
        ProductSerial serial = findWithLock(id);
        SerialStatus oldStatus = serial.getStatus();
        serial.setStatus(req.newStatus());
        if (req.note() != null) serial.setNote(req.note());
        serialRepo.save(serial);
        recordHistory(serial, "STATUS_UPDATED", oldStatus, req.newStatus(),
                req.sourceDocumentType(), req.sourceDocumentId(),
                serial.getBranchId(), serial.getBranchId(),
                warehouseId(serial), warehouseId(serial));
        return ProductSerialDto.from(serial);
    }

    // ──────────────────────────────────────────────
    // TRANSFER
    // ──────────────────────────────────────────────

    public ProductSerialDto transfer(Long id, TransferSerialRequest req) {
        ProductSerial serial = findWithLock(id);

        // Kiem tra khong ban serial dang ban
        if (serial.getStatus() == SerialStatus.SOLD) {
            throw new BusinessException("Khong the chuyen kho serial da ban: " + serial.getSerialNumber());
        }

        Long fromBranchId = serial.getBranchId();
        Long fromWarehouseId = warehouseId(serial);
        Long toWarehouseId = req.toWarehouseId();

        serial.setBranchId(req.toBranchId());
        if (req.toWarehouseId() != null) {
            Warehouse wh = warehouseRepo.findById(req.toWarehouseId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay kho: " + req.toWarehouseId()));
            serial.setWarehouse(wh);
        } else {
            serial.setWarehouse(null);
        }

        SerialStatus oldStatus = serial.getStatus();
        serial.setStatus(SerialStatus.TRANSFERRED);
        serialRepo.save(serial);

        recordHistory(serial, "TRANSFERRED", oldStatus, SerialStatus.TRANSFERRED,
                req.sourceDocumentType() != null ? req.sourceDocumentType() : "INVENTORY_TRANSFER",
                req.sourceDocumentId(),
                fromBranchId, req.toBranchId(), fromWarehouseId, toWarehouseId);

        // Sau khi chuyen thanh cong, doi status thanh IN_STOCK o chi nhanh moi
        serial.setStatus(SerialStatus.IN_STOCK);
        serialRepo.save(serial);
        recordHistory(serial, "RECEIVED", SerialStatus.TRANSFERRED, SerialStatus.IN_STOCK,
                req.sourceDocumentType() != null ? req.sourceDocumentType() : "INVENTORY_TRANSFER",
                req.sourceDocumentId(),
                fromBranchId, req.toBranchId(), fromWarehouseId, toWarehouseId);

        return ProductSerialDto.from(serial);
    }

    // ──────────────────────────────────────────────
    // MARK DEFECTIVE
    // ──────────────────────────────────────────────

    public ProductSerialDto markDefective(Long id, String reason) {
        ProductSerial serial = findWithLock(id);
        if (serial.getStatus() == SerialStatus.SOLD) {
            throw new BusinessException("Khong the danh dau loi serial da ban. Dung bao hanh/sua chua thay.");
        }
        SerialStatus oldStatus = serial.getStatus();
        serial.setStatus(SerialStatus.DEFECTIVE);
        serial.setDefectReason(reason);
        serialRepo.save(serial);
        recordHistory(serial, "DEFECTIVE", oldStatus, SerialStatus.DEFECTIVE,
                "MANUAL", null, serial.getBranchId(), serial.getBranchId(),
                warehouseId(serial), warehouseId(serial));
        return ProductSerialDto.from(serial);
    }

    // ──────────────────────────────────────────────
    // WARRANTY / REPAIR
    // ──────────────────────────────────────────────

    public ProductSerialDto sendToWarranty(Long id, String sourceDocType, String sourceDocId) {
        ProductSerial serial = findWithLock(id);
        SerialStatus oldStatus = serial.getStatus();
        serial.setStatus(SerialStatus.WARRANTY);
        serialRepo.save(serial);
        recordHistory(serial, "WARRANTY_ACTIVATED", oldStatus, SerialStatus.WARRANTY,
                sourceDocType, sourceDocId, serial.getBranchId(), serial.getBranchId(),
                warehouseId(serial), warehouseId(serial));
        return ProductSerialDto.from(serial);
    }

    public ProductSerialDto sendToRepair(Long id, String ticketNo) {
        ProductSerial serial = findWithLock(id);
        SerialStatus oldStatus = serial.getStatus();
        serial.setStatus(SerialStatus.REPAIRING);
        serial.setLastServiceTicketNo(ticketNo);
        serialRepo.save(serial);
        recordHistory(serial, "SENT_TO_REPAIR", oldStatus, SerialStatus.REPAIRING,
                "SERVICE_TICKET", ticketNo, serial.getBranchId(), serial.getBranchId(),
                warehouseId(serial), warehouseId(serial));
        return ProductSerialDto.from(serial);
    }

    public ProductSerialDto returnFromRepair(Long id, String note) {
        ProductSerial serial = findWithLock(id);
        SerialStatus oldStatus = serial.getStatus();
        serial.setStatus(SerialStatus.IN_STOCK);
        serial.setLastServicedAt(LocalDate.now());
        if (note != null) serial.setNote(note);
        serialRepo.save(serial);
        recordHistory(serial, "REPAIRED", oldStatus, SerialStatus.IN_STOCK,
                "SERVICE_TICKET", serial.getLastServiceTicketNo(),
                serial.getBranchId(), serial.getBranchId(),
                warehouseId(serial), warehouseId(serial));
        return ProductSerialDto.from(serial);
    }

    // ──────────────────────────────────────────────
    // SALE ELIGIBILITY (dung boi SalesService, DepositService)
    // ──────────────────────────────────────────────

    /**
     * Kiem tra serial co the ban cho customerId khong.
     * Nem BusinessException neu khong hop le.
     * Tra ve serial da lock (pessimistic) de caller dung tiep.
     */
    public ProductSerial validateAndLockForSale(Long serialId, Long customerId) {
        ProductSerial serial = findWithLock(serialId);
        switch (serial.getStatus()) {
            case SOLD -> throw new BusinessException(
                    "Serial " + serial.getSerialNumber() + " da duoc ban roi.");
            case DEFECTIVE, DAMAGED -> throw new BusinessException(
                    "Serial " + serial.getSerialNumber() + " dang bi loi, khong the ban.");
            case RESERVED -> {
                if (customerId != null && !customerId.equals(serial.getReservedCustomerId())) {
                    throw new BusinessException(
                            "Serial " + serial.getSerialNumber() + " dang duoc giu cho khach hang khac.");
                }
            }
            case REPAIRING, SERVICE, WARRANTY -> throw new BusinessException(
                    "Serial " + serial.getSerialNumber() + " dang trong qua trinh sua chua/bao hanh.");
            case RETURNED_TO_SUPPLIER -> throw new BusinessException(
                    "Serial " + serial.getSerialNumber() + " da tra lai nha cung cap.");
            default -> { /* IN_STOCK, TRANSFERRED OK */ }
        }
        return serial;
    }

    // ──────────────────────────────────────────────
    // INTERNAL HELPERS
    // ──────────────────────────────────────────────

    private ProductSerial findById(Long id) {
        return serialRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay serial id=" + id));
    }

    private ProductSerial findWithLock(Long id) {
        return serialRepo.findWithLockById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay serial id=" + id));
    }

    private Long warehouseId(ProductSerial s) {
        return s.getWarehouse() != null ? s.getWarehouse().getId() : null;
    }

    private void recordHistory(
            ProductSerial serial,
            String action,
            SerialStatus oldStatus,
            SerialStatus newStatus,
            String sourceDocType,
            String sourceDocId,
            Long branchFromId,
            Long branchToId,
            Long warehouseFromId,
            Long warehouseToId
    ) {
        String actor;
        try {
            actor = branchSecurity.currentUser().getUsername();
        } catch (Exception e) {
            actor = "SYSTEM";
        }
        ProductSerialHistory h = new ProductSerialHistory();
        h.setSerialId(serial.getId());
        h.setAction(action);
        h.setOldStatus(oldStatus);
        h.setNewStatus(newStatus);
        h.setSourceDocumentType(sourceDocType);
        h.setSourceDocumentId(sourceDocId);
        h.setBranchFromId(branchFromId);
        h.setBranchToId(branchToId);
        h.setWarehouseFromId(warehouseFromId);
        h.setWarehouseToId(warehouseToId);
        h.setCreatedBy(actor);
        historyRepo.save(h);
    }
}
