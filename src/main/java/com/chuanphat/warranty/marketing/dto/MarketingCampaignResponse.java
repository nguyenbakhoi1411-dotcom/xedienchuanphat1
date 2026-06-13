package com.chuanphat.warranty.marketing.dto;

import com.chuanphat.warranty.marketing.entity.MarketingCampaign;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MarketingCampaignResponse(
        Long id,
        String name,
        String source,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal budget,
        String status,
        String note
) {
    public static MarketingCampaignResponse from(MarketingCampaign campaign) {
        return new MarketingCampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getSource(),
                campaign.getStartDate(),
                campaign.getEndDate(),
                campaign.getBudget(),
                campaign.getStatus(),
                campaign.getNote()
        );
    }
}
