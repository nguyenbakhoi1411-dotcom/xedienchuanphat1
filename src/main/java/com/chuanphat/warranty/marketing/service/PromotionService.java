package com.chuanphat.warranty.marketing.service;

import com.chuanphat.warranty.marketing.dto.PromotionCalculateRequest;
import com.chuanphat.warranty.marketing.dto.PromotionCalculateResponse;
import com.chuanphat.warranty.marketing.entity.Promotion;
import com.chuanphat.warranty.marketing.enums.PromotionStatus;
import com.chuanphat.warranty.marketing.repository.PromotionRepository;
import com.chuanphat.warranty.marketing.repository.PromotionUsageRepository;
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
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionUsageRepository promotionUsageRepository;

    @Transactional(readOnly = true)
    public PromotionCalculateResponse calculate(PromotionCalculateRequest request) {
        List<Promotion> activePromotions = promotionRepository.findActivePromotions(PromotionStatus.ACTIVE, LocalDateTime.now());
        
        PromotionCalculateResponse response = PromotionCalculateResponse.builder()
                .promotionsApplied(new ArrayList<>())
                .khongApDung(new ArrayList<>())
                .tongGiam(BigDecimal.ZERO)
                .tongSauKM(request.getTongTienHang())
                .build();

        BigDecimal currentTotal = request.getTongTienHang() != null ? request.getTongTienHang() : BigDecimal.ZERO;
        boolean hasNonStackableApplied = false;

        for (Promotion promo : activePromotions) {
            if (hasNonStackableApplied) {
                response.getKhongApDung().add(createNotApplied(promo, "Cannot stack with previously applied promotion"));
                continue;
            }

            // Check Limits
            if (promo.getSoLanSuDungMax() != null && promo.getSoLanDaSuDung() >= promo.getSoLanSuDungMax()) {
                response.getKhongApDung().add(createNotApplied(promo, "Promotion usage limit reached"));
                continue;
            }

            if (request.getCustomerId() != null) {
                long userUsage = promotionUsageRepository.countUsageByCustomer(promo.getId(), request.getCustomerId());
                if (userUsage >= promo.getMoiKhMaxLan()) {
                    response.getKhongApDung().add(createNotApplied(promo, "Customer usage limit reached"));
                    continue;
                }
            }

            // Check Min Order
            if (promo.getGiaTriDonToiThieu().compareTo(BigDecimal.ZERO) > 0 && currentTotal.compareTo(promo.getGiaTriDonToiThieu()) < 0) {
                response.getKhongApDung().add(createNotApplied(promo, "Minimum order value not met"));
                continue;
            }

            // Evaluate
            boolean applied = false;
            BigDecimal discount = BigDecimal.ZERO;
            PromotionCalculateResponse.GiftProduct gift = null;

            switch (promo.getLoaiKm()) {
                case PERCENT_DISCOUNT:
                    discount = currentTotal.multiply(promo.getGiaTriChietKhau().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                    if (promo.getGiaTriKmToiDa() != null && discount.compareTo(promo.getGiaTriKmToiDa()) > 0) {
                        discount = promo.getGiaTriKmToiDa();
                    }
                    applied = true;
                    break;
                case FIXED_DISCOUNT:
                case MIN_ORDER_DISCOUNT:
                    discount = promo.getGiaTriChietKhau();
                    applied = true;
                    break;
                case BUY_X_GET_Y:
                    // Check if cart has spMua
                    if (promo.getSpMua() != null && request.getItems() != null) {
                        BigDecimal purchasedQty = request.getItems().stream()
                                .filter(i -> i.getSanPhamId().equals(promo.getSpMua().getId()))
                                .map(PromotionCalculateRequest.CartItem::getSoLuong)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                                
                        if (purchasedQty.compareTo(promo.getSoLuongMua()) >= 0) {
                            // Calculate multiples
                            BigDecimal times = purchasedQty.divide(promo.getSoLuongMua(), 0, RoundingMode.DOWN);
                            BigDecimal freeQty = promo.getSoLuongTang().multiply(times);
                            
                            gift = PromotionCalculateResponse.GiftProduct.builder()
                                    .id(promo.getSpTang().getId())
                                    .ten(promo.getSpTang().getProductName())
                                    .soLuong(freeQty)
                                    .build();
                            applied = true;
                        } else {
                            response.getKhongApDung().add(createNotApplied(promo, "Not enough quantity for BUY X GET Y"));
                        }
                    }
                    break;
                case GIFT_PRODUCT:
                    gift = PromotionCalculateResponse.GiftProduct.builder()
                            .id(promo.getSpTang().getId())
                            .ten(promo.getSpTang().getProductName())
                            .soLuong(promo.getSoLuongTang())
                            .build();
                    applied = true;
                    break;
                default:
                    response.getKhongApDung().add(createNotApplied(promo, "Promotion type not supported yet"));
                    break;
            }

            if (applied) {
                // Ensure discount doesn't exceed current total
                if (discount.compareTo(currentTotal) > 0) {
                    discount = currentTotal;
                }
                
                response.getPromotionsApplied().add(PromotionCalculateResponse.PromotionApplied.builder()
                        .promotionId(promo.getId())
                        .tenKM(promo.getTenKhuyenMai())
                        .loaiKM(promo.getLoaiKm())
                        .soTienGiam(discount)
                        .spTang(gift)
                        .build());
                        
                currentTotal = currentTotal.subtract(discount);
                response.setTongGiam(response.getTongGiam().add(discount));
                
                if (Boolean.FALSE.equals(promo.getCoTheCongDon())) {
                    hasNonStackableApplied = true;
                }
            }
        }

        response.setTongSauKM(currentTotal);
        return response;
    }

    private PromotionCalculateResponse.PromotionNotApplied createNotApplied(Promotion promo, String reason) {
        return PromotionCalculateResponse.PromotionNotApplied.builder()
                .promotionId(promo.getId())
                .tenKM(promo.getTenKhuyenMai())
                .lyDo(reason)
                .build();
    }
}
