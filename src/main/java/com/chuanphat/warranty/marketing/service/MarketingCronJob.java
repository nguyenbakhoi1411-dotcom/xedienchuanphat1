package com.chuanphat.warranty.marketing.service;

import com.chuanphat.warranty.marketing.repository.PriceListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;


@Component
@RequiredArgsConstructor
public class MarketingCronJob {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MarketingCronJob.class);

    private final PriceListRepository priceListRepository;
    private final CustomerPriceGroupService customerPriceGroupService;

    // Run every day at 00:01 AM
    @Scheduled(cron = "0 1 0 * * ?")
    @Transactional
    public void dailyMarketingTasks() {
        log.info("Starting daily marketing cron jobs...");

        // 1. Deactivate expired price lists
        int deactivated = priceListRepository.deactivateExpiredPriceLists(LocalDate.now());
        if (deactivated > 0) {
            log.info("Deactivated {} expired price lists", deactivated);
        }

        // 2. Auto-classify customers to price groups based on total accumulated purchase
        int changed = customerPriceGroupService.autoClassifyCustomers();
        if (changed > 0) {
            log.info("Auto-classified {} customers to new price groups", changed);
        }

        log.info("Finished daily marketing cron jobs.");
    }
}

