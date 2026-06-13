package com.chuanphat.warranty.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SlowApiLoggingConfig implements WebMvcConfigurer {
    private static final Logger log = LoggerFactory.getLogger(SlowApiLoggingConfig.class);
    private static final long SLOW_API_THRESHOLD_MS = 1_500;
    private static final String START_TIME_ATTRIBUTE = "slowApiStartTime";

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SlowApiInterceptor()).addPathPatterns("/api/**");
    }

    private static class SlowApiInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis());
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
            Object start = request.getAttribute(START_TIME_ATTRIBUTE);
            if (!(start instanceof Long startTime)) {
                return;
            }
            long elapsedMs = System.currentTimeMillis() - startTime;
            if (elapsedMs >= SLOW_API_THRESHOLD_MS) {
                log.warn(
                        "Slow API: {} ms, method={}, uri={}, status={}",
                        elapsedMs,
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus()
                );
            }
        }
    }
}
