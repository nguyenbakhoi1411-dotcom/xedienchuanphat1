package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.core.dto.BranchDto;
import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.repository.BranchRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BranchService {
    private final BranchRepository branchRepository;
    private final BranchSecurity branchSecurity;

    public BranchService(BranchRepository branchRepository, BranchSecurity branchSecurity) {
        this.branchRepository = branchRepository;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public PageResponse<BranchDto> list(String keyword, int page, int pageSize) {
        AppUser user = branchSecurity.currentUser();
        if (!branchSecurity.isAdmin(user)) {
            Branch branch = user.getBranchId() == null ? null : get(user.getBranchId());
            return PageResponse.from(new PageImpl<>(
                    branch == null || branch.getStatus() == RecordStatus.DELETED ? java.util.List.of() : java.util.List.of(BranchDto.from(branch)),
                    PageRequest.of(page, pageSize),
                    branch == null || branch.getStatus() == RecordStatus.DELETED ? 0 : 1
            ));
        }
        return PageResponse.from(branchRepository
                .findByStatusNotAndNameContainingIgnoreCase(RecordStatus.DELETED, keyword == null ? "" : keyword, PageRequest.of(page, pageSize))
                .map(BranchDto::from));
    }

    @Transactional
    public BranchDto create(BranchDto request) {
        if (branchRepository.existsByCodeIgnoreCase(request.code())) {
            throw new BusinessException("Branch code already exists");
        }
        Branch branch = new Branch();
        apply(branch, request);
        return BranchDto.from(branchRepository.save(branch));
    }

    @Transactional
    public BranchDto update(Long id, BranchDto request) {
        Branch branch = get(id);
        apply(branch, request);
        return BranchDto.from(branchRepository.save(branch));
    }

    @Transactional
    public void delete(Long id) {
        Branch branch = get(id);
        branch.setStatus(RecordStatus.DELETED);
        branchRepository.save(branch);
    }

    public Branch get(Long id) {
        return branchRepository.findById(id).orElseThrow(() -> new NotFoundException("Branch not found: " + id));
    }

    private void apply(Branch branch, BranchDto request) {
        branch.setCode(request.code());
        branch.setName(request.name());
        branch.setAddress(request.address());
        branch.setPhone(request.phone());
        branch.setStatus(request.status() == null ? RecordStatus.ACTIVE : request.status());
    }
}
