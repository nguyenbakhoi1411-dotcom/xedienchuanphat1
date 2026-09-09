package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.CostCenterDto;
import com.chuanphat.warranty.accounting.dto.CostCenterRequest;
import com.chuanphat.warranty.accounting.entity.CostCenter;
import com.chuanphat.warranty.accounting.repository.CostCenterRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.ConflictException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CostCenterService {

    private final CostCenterRepository repository;

    public CostCenterService(CostCenterRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<CostCenterDto> list(String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("code"));
        if (keyword != null && !keyword.isBlank()) {
            return PageResponse.from(repository.findByStatusNotAndNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
                    RecordStatus.INACTIVE, keyword, keyword, pageable).map(CostCenterDto::from));
        }
        return PageResponse.from(repository.findAll(pageable).map(CostCenterDto::from));
    }

    public CostCenterDto create(CostCenterRequest req) {
        if (repository.existsByCodeIgnoreCase(req.code())) {
            throw new ConflictException("Mã Cost Center đã tồn tại: " + req.code());
        }
        CostCenter cc = new CostCenter();
        cc.setCode(req.code());
        cc.setName(req.name());
        cc.setDescription(req.description());
        return CostCenterDto.from(repository.save(cc));
    }

    public CostCenterDto update(Long id, CostCenterRequest req) {
        CostCenter cc = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy Cost Center: " + id));
        if (!cc.getCode().equalsIgnoreCase(req.code()) && repository.existsByCodeIgnoreCase(req.code())) {
            throw new ConflictException("Mã Cost Center đã tồn tại: " + req.code());
        }
        cc.setCode(req.code());
        cc.setName(req.name());
        cc.setDescription(req.description());
        return CostCenterDto.from(repository.save(cc));
    }

    public CostCenterDto deactivate(Long id) {
        CostCenter cc = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy Cost Center: " + id));
        cc.setStatus(RecordStatus.INACTIVE);
        return CostCenterDto.from(repository.save(cc));
    }
}
