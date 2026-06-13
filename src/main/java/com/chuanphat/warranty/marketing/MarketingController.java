package com.chuanphat.warranty.marketing;

import com.chuanphat.warranty.marketing.dto.MarketingCampaignRequest;
import com.chuanphat.warranty.marketing.dto.MarketingCampaignResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketing")
public class MarketingController {
    private final MarketingService service;

    public MarketingController(MarketingService service) {
        this.service = service;
    }

    @GetMapping("/campaigns")
    @PreAuthorize("hasAuthority('MARKETING_VIEW')")
    public List<MarketingCampaignResponse> campaigns() {
        return service.campaigns();
    }

    @PostMapping("/campaigns")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('MARKETING_CREATE')")
    public MarketingCampaignResponse createCampaign(@Valid @RequestBody MarketingCampaignRequest request) {
        return service.createCampaign(request);
    }

    @PutMapping("/campaigns/{id}")
    @PreAuthorize("hasAuthority('MARKETING_UPDATE')")
    public MarketingCampaignResponse updateCampaign(@PathVariable Long id, @Valid @RequestBody MarketingCampaignRequest request) {
        return service.updateCampaign(id, request);
    }

    @GetMapping("/customer-sources")
    @PreAuthorize("hasAuthority('MARKETING_VIEW')")
    public List<Map<String, Object>> customerSources() {
        return service.customerSources();
    }
}
