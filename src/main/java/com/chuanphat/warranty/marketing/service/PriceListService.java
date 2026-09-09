package com.chuanphat.warranty.marketing.service;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.marketing.dto.PriceListDTO;
import com.chuanphat.warranty.marketing.dto.PriceListItemDTO;
import com.chuanphat.warranty.marketing.entity.CustomerPriceGroup;
import com.chuanphat.warranty.marketing.entity.PriceList;
import com.chuanphat.warranty.marketing.entity.PriceListItem;
import com.chuanphat.warranty.marketing.enums.PriceListStatus;
import com.chuanphat.warranty.marketing.repository.CustomerPriceGroupRepository;
import com.chuanphat.warranty.marketing.repository.PriceListItemRepository;
import com.chuanphat.warranty.marketing.repository.PriceListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PriceListService {
    private final PriceListRepository priceListRepository;
    private final PriceListItemRepository priceListItemRepository;
    private final CustomerRepository customerRepository;
    private final CustomerPriceGroupRepository customerPriceGroupRepository;

    @Transactional(readOnly = true)
    public Page<PriceList> getAllPriceLists(PriceListStatus trangThai, Pageable pageable) {
        if (trangThai != null) {
            return priceListRepository.findByTrangThai(trangThai, pageable);
        }
        return priceListRepository.findAll(pageable);
    }

    @Transactional
    public PriceList createPriceList(PriceListDTO dto) {
        if (dto.getMaBangGia() == null || dto.getMaBangGia().isEmpty()) {
            long count = priceListRepository.count() + 1;
            dto.setMaBangGia(String.format("BG-%04d", count));
        }

        PriceList priceList = PriceList.builder()
                .maBangGia(dto.getMaBangGia())
                .tenBangGia(dto.getTenBangGia())
                .loaiBangGia(dto.getLoaiBangGia())
                .moTa(dto.getMoTa())
                .apDungTu(dto.getApDungTu())
                .apDungDen(dto.getApDungDen())
                .tyLeChietKhauMacDinh(dto.getTyLeChietKhauMacDinh())
                .laBangGiaMacDinh(dto.getLaBangGiaMacDinh() != null ? dto.getLaBangGiaMacDinh() : false)
                .ghiChu(dto.getGhiChu())
                .build();

        priceList = priceListRepository.save(priceList);

        if (Boolean.TRUE.equals(priceList.getLaBangGiaMacDinh())) {
            priceListRepository.setAllOthersNotDefault(priceList.getId());
        }

        return priceList;
    }

    @Transactional(readOnly = true)
    public PriceList getPriceList(Long id) {
        return priceListRepository.findById(id).orElseThrow(() -> new RuntimeException("Price List not found"));
    }

    @Transactional
    public void activatePriceList(Long id) {
        PriceList priceList = getPriceList(id);
        if (priceList.getApDungTu().isAfter(LocalDate.now())) {
            throw new RuntimeException("Cannot activate price list before start date");
        }
        priceList.setTrangThai(PriceListStatus.ACTIVE);
        priceListRepository.save(priceList);
    }

    @Transactional(readOnly = true)
    public PriceList getActivePriceListForCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
        
        if (customer.getCustomerPriceGroupId() != null) {
            CustomerPriceGroup group = customerPriceGroupRepository.findById(customer.getCustomerPriceGroupId()).orElse(null);
            if (group != null && group.getPriceList().getTrangThai() == PriceListStatus.ACTIVE) {
                return group.getPriceList();
            }
        }
        
        return priceListRepository.findFirstByLaBangGiaMacDinhTrue()
                .orElseThrow(() -> new RuntimeException("No default price list found"));
    }

    @Transactional(readOnly = true)
    public PriceListItemDTO getPriceForProductAndCustomer(Long sanPhamId, Long customerId) {
        PriceList priceList = getActivePriceListForCustomer(customerId);
        
        Optional<PriceListItem> itemOpt = priceListItemRepository.findByPriceListIdAndSanPhamId(priceList.getId(), sanPhamId);
        if (itemOpt.isPresent()) {
            PriceListItem item = itemOpt.get();
            return PriceListItemDTO.builder()
                    .giaBan(item.getGiaBan())
                    .giaToiThieu(item.getGiaToiThieu())
                    .build();
        }
        
        return null;
    }
}
