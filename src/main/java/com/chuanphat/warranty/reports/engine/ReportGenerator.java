package com.chuanphat.warranty.reports.engine;

import java.util.Map;

public interface ReportGenerator {
    boolean supports(String reportType);
    Map<String, Object> generate(ReportCriteria criteria);
}
