package com.chuanphat.warranty.accounting.period;

import com.chuanphat.warranty.accounting.service.AccountingPeriodService;
import java.time.LocalDate;
import org.springframework.beans.factory.BeanFactory;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.expression.BeanFactoryResolver;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AccountingPeriodLockAspect {
    private final AccountingPeriodService periodService;
    private final BeanFactory beanFactory;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final DefaultParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    public AccountingPeriodLockAspect(AccountingPeriodService periodService, BeanFactory beanFactory) {
        this.periodService = periodService;
        this.beanFactory = beanFactory;
    }

    @Before("@annotation(guard)")
    public void assertPeriodOpen(JoinPoint joinPoint, GuardAccountingPeriod guard) {
        EvaluationContext context = context(joinPoint);
        LocalDate date = parser.parseExpression(guard.date()).getValue(context, LocalDate.class);
        if (guard.branchIds().length > 0) {
            for (String branchExpression : guard.branchIds()) {
                periodService.assertPeriodNotLocked(date, parser.parseExpression(branchExpression).getValue(context, Long.class));
            }
            return;
        }
        Long branchId = guard.branchId().isBlank() ? null : parser.parseExpression(guard.branchId()).getValue(context, Long.class);
        periodService.assertPeriodNotLocked(date, branchId);
    }

    private EvaluationContext context(JoinPoint joinPoint) {
        StandardEvaluationContext context = new StandardEvaluationContext();
        context.setBeanResolver(new BeanFactoryResolver(beanFactory));

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = parameterNameDiscoverer.getParameterNames(signature.getMethod());
        Object[] args = joinPoint.getArgs();
        for (int i = 0; i < args.length; i++) {
            context.setVariable("p" + i, args[i]);
            context.setVariable("a" + i, args[i]);
            if (parameterNames != null && i < parameterNames.length) {
                context.setVariable(parameterNames[i], args[i]);
            }
        }
        return context;
    }
}
