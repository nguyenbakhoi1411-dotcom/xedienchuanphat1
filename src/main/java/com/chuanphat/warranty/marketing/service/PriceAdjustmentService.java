package com.chuanphat.warranty.marketing.service;

import com.chuanphat.warranty.marketing.dto.CreatePriceAdjustmentRequest;
import com.chuanphat.warranty.marketing.dto.PriceAdjustmentPreviewDTO;
import com.chuanphat.warranty.marketing.dto.PriceAdjustmentPreviewItemDTO;
import com.chuanphat.warranty.marketing.entity.PriceAdjustment;
import com.chuanphat.warranty.marketing.entity.PriceAdjustmentDetail;
import com.chuanphat.warranty.marketing.entity.PriceHistory;
import com.chuanphat.warranty.marketing.entity.PriceList;
import com.chuanphat.warranty.marketing.entity.PriceListItem;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentRounding;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentScope;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentStatus;
import com.chuanphat.warranty.marketing.enums.PriceChangeSource;
import com.chuanphat.warranty.marketing.repository.PriceAdjustmentDetailRepository;
import com.chuanphat.warranty.marketing.repository.PriceAdjustmentRepository;
import com.chuanphat.warranty.marketing.repository.PriceHistoryRepository;
import com.chuanphat.warranty.marketing.repository.PriceListItemRepository;
import com.chuanphat.warranty.marketing.repository.PriceListRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceAdjustmentService {

    private final PriceAdjustmentRepository priceAdjustmentRepository;
    private final PriceAdjustmentDetailRepository priceAdjustmentDetailRepository;
    private final PriceListItemRepository priceListItemRepository;
    private final PriceListRepository priceListRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public PriceAdjustment createAdjustment(CreatePriceAdjustmentRequest req) throws JsonProcessingException {
        PriceList priceList = priceListRepository.findById(req.getPriceListId())
                .orElseThrow(() -> new RuntimeException("Price List not found"));

        PriceAdjustment adj = PriceAdjustment.builder()
                .maDieuChinh("DC-" + System.currentTimeMillis())
                .tenDieuChinh(req.getTenDieuChinh())
                .priceList(priceList)
                .phamVi(req.getPhamVi())
                .kieuDieuChinh(req.getKieuDieuChinh())
                .giaTri(req.getGiaTri())
                .lamTron(req.getLamTron() != null ? req.getLamTron() : PriceAdjustmentRounding.THOUSAND)
                .apDungTu(req.getApDungTu())
                .apDungDen(req.getApDungDen())
                .ghiChu(req.getGhiChu())
                .build();

        if (req.getCategoryIds() != null) {
            adj.setCategoryIds(objectMapper.writeValueAsString(req.getCategoryIds()));
        }
        if (req.getProductIds() != null) {
            adj.setProductIds(objectMapper.writeValueAsString(req.getProductIds()));
        }

        return priceAdjustmentRepository.save(adj);
    }

    @Transactional(readOnly = true)
    public PriceAdjustmentPreviewDTO previewAdjustment(Long adjustmentId) {
        PriceAdjustment adj = priceAdjustmentRepository.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Adjustment not found"));

        List<PriceListItem> items = priceListItemRepository.findByPriceListId(adj.getPriceList().getId());
        
        // In real app, filter items based on adj.getPhamVi() and categoryIds/productIds
        if (adj.getPhamVi() == PriceAdjustmentScope.PRODUCT && adj.getProductIds() != null) {
            // pseudo-filtering for demo
        }

        long count = 0;
        BigDecimal sumOld = BigDecimal.ZERO;
        BigDecimal sumNew = BigDecimal.ZERO;
        int underMin = 0;
        int lowMargin = 0;
        List<PriceAdjustmentPreviewItemDTO> previewList = new ArrayList<>();

        for (PriceListItem item : items) {
            BigDecimal oldPrice = item.getGiaBan() != null ? item.getGiaBan() : BigDecimal.ZERO;
            BigDecimal newPrice = calculateNewPrice(oldPrice, item.getGiaVon(), adj);
            
            BigDecimal diff = newPrice.subtract(oldPrice);
            BigDecimal percent = oldPrice.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO 
                : diff.divide(oldPrice, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));

            BigDecimal newMargin = BigDecimal.ZERO;
            if (item.getGiaVon() != null && newPrice.compareTo(BigDecimal.ZERO) > 0) {
                newMargin = newPrice.subtract(item.getGiaVon()).divide(newPrice, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
            }

            if (item.getGiaToiThieu() != null && newPrice.compareTo(item.getGiaToiThieu()) < 0) {
                underMin++;
            }
            if (newMargin.compareTo(new BigDecimal("10")) < 0) {
                lowMargin++;
            }

            if (count < 50) {
                previewList.add(PriceAdjustmentPreviewItemDTO.builder()
                        .sanPhamId(item.getSanPham().getId())
                        .maSanPham(item.getMaSanPham())
                        .tenSanPham(item.getTenSanPham())
                        .giaCu(oldPrice)
                        .giaMoi(newPrice)
                        .chenhLech(diff)
                        .phanTramThayDoi(percent)
                        .giaVon(item.getGiaVon())
                        .tyLeLaiGopMoi(newMargin)
                        .build());
            }

            sumOld = sumOld.add(oldPrice);
            sumNew = sumNew.add(newPrice);
            count++;
        }

        BigDecimal avgOld = count == 0 ? BigDecimal.ZERO : sumOld.divide(new BigDecimal(count), 0, RoundingMode.HALF_UP);
        BigDecimal avgNew = count == 0 ? BigDecimal.ZERO : sumNew.divide(new BigDecimal(count), 0, RoundingMode.HALF_UP);

        return PriceAdjustmentPreviewDTO.builder()
                .tongSanPham(count)
                .giaTriTrungBinhCu(avgOld)
                .giaTriTrungBinhMoi(avgNew)
                .soSanPhamDuoiGiaToiThieu(underMin)
                .soSanPhamLaiGopThap(lowMargin)
                .preview(previewList)
                .build();
    }

    @Transactional
    public void applyAdjustment(Long adjustmentId, String user) {
        PriceAdjustment adj = priceAdjustmentRepository.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Adjustment not found"));
                
        if (adj.getTrangThai() != PriceAdjustmentStatus.DRAFT) {
            throw new RuntimeException("Adjustment is already applied or cancelled");
        }

        List<PriceListItem> items = priceListItemRepository.findByPriceListId(adj.getPriceList().getId());
        List<PriceAdjustmentDetail> details = new ArrayList<>();
        List<PriceHistory> histories = new ArrayList<>();

        for (PriceListItem item : items) {
            BigDecimal oldPrice = item.getGiaBan() != null ? item.getGiaBan() : BigDecimal.ZERO;
            BigDecimal newPrice = calculateNewPrice(oldPrice, item.getGiaVon(), adj);
            
            // 1. Update PriceListItem
            item.setGiaBan(newPrice);
            if (item.getGiaVon() != null && newPrice.compareTo(BigDecimal.ZERO) > 0) {
                item.setTyLeLaiGop(newPrice.subtract(item.getGiaVon()).divide(newPrice, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")));
            }
            
            // 2. Add Detail
            PriceAdjustmentDetail detail = PriceAdjustmentDetail.builder()
                    .adjustment(adj)
                    .sanPham(item.getSanPham())
                    .tenSanPham(item.getTenSanPham())
                    .giaCu(oldPrice)
                    .giaMoi(newPrice)
                    .phanTramThayDoi(oldPrice.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : newPrice.subtract(oldPrice).divide(oldPrice, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")))
                    .build();
            details.add(detail);
            
            // 3. Add History
            PriceHistory history = PriceHistory.builder()
                    .sanPham(item.getSanPham())
                    .priceList(adj.getPriceList())
                    .giaCu(oldPrice)
                    .giaMoi(newPrice)
                    .lyDoThayDoi("Applied via adjustment: " + adj.getTenDieuChinh())
                    .nguonThayDoi(PriceChangeSource.ADJUSTMENT)
                    .adjustment(adj)
                    .nguoiThayDoi(user)
                    .build();
            histories.add(history);
        }

        priceListItemRepository.saveAll(items);
        priceAdjustmentDetailRepository.saveAll(details);
        priceHistoryRepository.saveAll(histories);

        adj.setTrangThai(PriceAdjustmentStatus.APPLIED);
        adj.setNgayApDung(LocalDateTime.now());
        adj.setAppliedBy(user);
        priceAdjustmentRepository.save(adj);
    }

    private BigDecimal calculateNewPrice(BigDecimal oldPrice, BigDecimal costPrice, PriceAdjustment adj) {
        BigDecimal newPrice = oldPrice;
        BigDecimal val = adj.getGiaTri();

        switch (adj.getKieuDieuChinh()) {
            case PERCENT_UP:
                newPrice = oldPrice.multiply(BigDecimal.ONE.add(val.divide(new BigDecimal("100"))));
                break;
            case PERCENT_DOWN:
                newPrice = oldPrice.multiply(BigDecimal.ONE.subtract(val.divide(new BigDecimal("100"))));
                break;
            case FIXED_UP:
                newPrice = oldPrice.add(val);
                break;
            case FIXED_DOWN:
                newPrice = oldPrice.subtract(val);
                break;
            case SET_PRICE:
                newPrice = val;
                break;
            case SET_MARGIN:
                if (costPrice != null && val.compareTo(new BigDecimal("100")) < 0) {
                    newPrice = costPrice.divide(BigDecimal.ONE.subtract(val.divide(new BigDecimal("100"))), 0, RoundingMode.HALF_UP);
                }
                break;
        }

        return roundPrice(newPrice, adj.getLamTron());
    }

    private BigDecimal roundPrice(BigDecimal price, PriceAdjustmentRounding mode) {
        if (mode == null || mode == PriceAdjustmentRounding.NONE) return price;
        long p = price.longValue();
        switch (mode) {
            case THOUSAND:
                p = Math.round(p / 1000.0) * 1000;
                break;
            case TEN_THOUSAND:
                p = Math.round(p / 10000.0) * 10000;
                break;
            case HUNDRED_THOUSAND:
                p = Math.round(p / 100000.0) * 100000;
                break;
        }
        return new BigDecimal(p);
    }
}
