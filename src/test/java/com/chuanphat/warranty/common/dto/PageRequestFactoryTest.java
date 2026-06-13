package com.chuanphat.warranty.common.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.chuanphat.warranty.exception.BusinessException;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PageRequestFactoryTest {
    @Test
    void capsLargePageSizeAndKeepsAllowedSort() {
        var request = PageRequestFactory.of(-10, 10_000, "createdAt,desc", Map.of("createdAt", "createdAt"), "createdAt,desc");

        assertThat(request.getPageNumber()).isZero();
        assertThat(request.getPageSize()).isEqualTo(200);
        assertThat(request.getSort().getOrderFor("createdAt")).isNotNull();
    }

    @Test
    void rejectsUnsupportedSortField() {
        assertThatThrownBy(() -> PageRequestFactory.of(0, 20, "unknown,asc", Map.of("createdAt", "createdAt"), "createdAt,desc"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Unsupported sort field");
    }
}
