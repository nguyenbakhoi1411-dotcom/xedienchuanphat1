package com.chuanphat.warranty.accounting.period;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface GuardAccountingPeriod {
    String date();
    String branchId() default "";
    String[] branchIds() default {};
}
