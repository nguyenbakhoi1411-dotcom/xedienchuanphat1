package com.chuanphat.warranty.common.dto;

import com.chuanphat.warranty.exception.BusinessException;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public final class PageRequestFactory {
    private static final int MAX_PAGE_SIZE = 200;

    private PageRequestFactory() {
    }

    public static PageRequest of(int page, int pageSize, String sort, Map<String, String> allowedSorts, String defaultSort) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.max(1, Math.min(pageSize, MAX_PAGE_SIZE));
        return PageRequest.of(safePage, safePageSize, parseSort(sort, allowedSorts, defaultSort));
    }

    private static Sort parseSort(String sort, Map<String, String> allowedSorts, String defaultSort) {
        String requestedSort = sort == null || sort.isBlank() ? defaultSort : sort;
        String[] parts = requestedSort.split(",", 2);
        String apiField = parts[0].trim();
        String entityField = allowedSorts.get(apiField);
        if (entityField == null) {
            throw new BusinessException("Unsupported sort field: " + apiField);
        }

        Sort.Direction direction = Sort.Direction.ASC;
        if (parts.length == 2 && !parts[1].isBlank()) {
            try {
                direction = Sort.Direction.fromString(parts[1].trim());
            } catch (IllegalArgumentException exception) {
                throw new BusinessException("Unsupported sort direction: " + parts[1].trim());
            }
        }

        return Sort.by(direction, entityField).and(Sort.by(Sort.Direction.DESC, "id"));
    }
}
