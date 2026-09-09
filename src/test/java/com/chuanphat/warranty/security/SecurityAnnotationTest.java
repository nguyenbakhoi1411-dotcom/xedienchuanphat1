package com.chuanphat.warranty.security;

import com.chuanphat.warranty.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.fail;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SecurityAnnotationTest extends PostgresIntegrationTest {

    // Không còn dùng Whitelist hardcode tên class nữa.
    // Tất cả API public PHẢI được gắn @PublicEndpoint.

    @Test
    public void testAllEndpointsHavePreAuthorize() throws Exception {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));
        scanner.addIncludeFilter(new AnnotationTypeFilter(Controller.class));

        List<String> unprotectedEndpoints = new ArrayList<>();

        for (BeanDefinition bd : scanner.findCandidateComponents("com.chuanphat.warranty")) {
            Class<?> clazz = Class.forName(bd.getBeanClassName());
            
            // Nếu Class được gắn @PublicEndpoint, coi như an toàn bỏ qua
            if (clazz.isAnnotationPresent(PublicEndpoint.class)) {
                continue;
            }

            // Kiểm tra xem Class có PreAuthorize không (nếu có thì toàn bộ method được bảo vệ)
            boolean classHasPreAuth = clazz.isAnnotationPresent(PreAuthorize.class);

            for (Method method : clazz.getDeclaredMethods()) {
                if (isMappingMethod(method)) {
                    boolean methodHasPreAuth = method.isAnnotationPresent(PreAuthorize.class);
                    boolean methodIsPublic = method.isAnnotationPresent(PublicEndpoint.class);
                    
                    if (!classHasPreAuth && !methodHasPreAuth && !methodIsPublic) {
                        unprotectedEndpoints.add(clazz.getSimpleName() + "." + method.getName());
                    }
                }
            }
        }

        if (!unprotectedEndpoints.isEmpty()) {
            StringBuilder errorMsg = new StringBuilder("PHÁT HIỆN LỖI BẢO MẬT NGHIÊM TRỌNG: Các Endpoint sau thiếu @PreAuthorize:\n");
            for (String ep : unprotectedEndpoints) {
                errorMsg.append("- ").append(ep).append("\n");
            }
            fail(errorMsg.toString());
        }
    }

    private boolean isMappingMethod(Method method) {
        return method.isAnnotationPresent(GetMapping.class) ||
               method.isAnnotationPresent(PostMapping.class) ||
               method.isAnnotationPresent(PutMapping.class) ||
               method.isAnnotationPresent(DeleteMapping.class) ||
               method.isAnnotationPresent(PatchMapping.class) ||
               method.isAnnotationPresent(RequestMapping.class);
    }
}
