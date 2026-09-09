package com.chuanphat.warranty.reports.engine;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class ReportEngine {
    private final List<ReportGenerator> generators;

    public ReportEngine(List<ReportGenerator> generators) {
        this.generators = generators;
    }

    public Map<String, Object> generateReport(ReportCriteria criteria) {
        ReportGenerator generator = generators.stream()
            .filter(g -> g.supports(criteria.reportType()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unsupported report type: " + criteria.reportType()));
        
        return generator.generate(criteria);
    }
}
