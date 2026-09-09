package com.chuanphat.warranty.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Đánh dấu một Controller hoặc Method là Public (Không cần Access Token).
 * Nếu được gán ở cấp Class, tất cả các method bên trong đều được public.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface PublicEndpoint {
}
