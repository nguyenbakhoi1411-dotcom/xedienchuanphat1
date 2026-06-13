package com.chuanphat.warranty.marketing;

import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.marketing.dto.MarketingCampaignRequest;
import com.chuanphat.warranty.marketing.dto.MarketingCampaignResponse;
import com.chuanphat.warranty.marketing.entity.MarketingCampaign;
import com.chuanphat.warranty.marketing.repository.MarketingCampaignRepository;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MarketingService {
    private final MarketingCampaignRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public MarketingService(MarketingCampaignRepository repository, JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<MarketingCampaignResponse> campaigns() {
        return repository.findAll().stream().map(MarketingCampaignResponse::from).toList();
    }

    @Transactional
    public MarketingCampaignResponse createCampaign(MarketingCampaignRequest request) {
        MarketingCampaign campaign = new MarketingCampaign();
        apply(campaign, request);
        return MarketingCampaignResponse.from(repository.save(campaign));
    }

    @Transactional
    public MarketingCampaignResponse updateCampaign(Long id, MarketingCampaignRequest request) {
        MarketingCampaign campaign = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Campaign not found: " + id));
        apply(campaign, request);
        return MarketingCampaignResponse.from(repository.save(campaign));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> customerSources() {
        return jdbcTemplate.queryForList("""
                select coalesce(source, 'UNKNOWN') source, count(*) customers
                from customers
                where status <> 'DELETED'
                group by source
                order by customers desc
                """);
    }

    private void apply(MarketingCampaign campaign, MarketingCampaignRequest request) {
        campaign.setName(request.name());
        campaign.setSource(request.source());
        campaign.setStartDate(request.startDate());
        campaign.setEndDate(request.endDate());
        campaign.setBudget(request.budget());
        campaign.setStatus(request.status());
        campaign.setNote(request.note());
    }
}
