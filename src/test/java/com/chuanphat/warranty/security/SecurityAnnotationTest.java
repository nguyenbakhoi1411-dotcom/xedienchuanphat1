package com.chuanphat.warranty.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.chuanphat.warranty.PostgresIntegrationTest;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityAnnotationTest extends PostgresIntegrationTest {
    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void everyControllerEndpointRequiresPreAuthorizeUnlessMarkedPublic() {
        Map<String, Object> controllers = applicationContext.getBeansWithAnnotation(RestController.class);
        controllers.putAll(applicationContext.getBeansWithAnnotation(Controller.class));

        List<String> unsecuredEndpoints = new ArrayList<>();
        controllers.forEach((beanName, bean) -> {
            Class<?> controllerClass = AopUtils.getTargetClass(bean);
            boolean classHasPreAuthorize = AnnotatedElementUtils.hasAnnotation(controllerClass, PreAuthorize.class);
            boolean classIsPublic = AnnotatedElementUtils.hasAnnotation(controllerClass, PublicEndpoint.class);

            for (Method method : controllerClass.getDeclaredMethods()) {
                if (!isRequestHandler(method) || classIsPublic || isPublic(method)) {
                    continue;
                }
                boolean methodHasPreAuthorize = AnnotatedElementUtils.hasAnnotation(method, PreAuthorize.class);
                if (!classHasPreAuthorize && !methodHasPreAuthorize) {
                    unsecuredEndpoints.add(controllerClass.getName() + "#" + method.getName());
                }
            }
        });

        assertThat(unsecuredEndpoints)
                .as("Controller endpoints must have @PreAuthorize or @PublicEndpoint")
                .isEmpty();
    }

    private boolean isRequestHandler(Method method) {
        return AnnotatedElementUtils.hasAnnotation(method, RequestMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, GetMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, PostMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, PutMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, PatchMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, DeleteMapping.class);
    }

    private boolean isPublic(Method method) {
        return AnnotatedElementUtils.hasAnnotation(method, PublicEndpoint.class);
    }
}
