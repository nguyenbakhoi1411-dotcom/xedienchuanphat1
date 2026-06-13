package com.chuanphat.warranty;

import java.lang.reflect.Field;

public final class BusinessCriticalTestSupport {
    private BusinessCriticalTestSupport() {
    }

    public static <T> T withId(T target, Long id) {
        try {
            Field field = findField(target.getClass(), "id");
            field.setAccessible(true);
            field.set(target, id);
            return target;
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException("Cannot set id on " + target.getClass().getName(), ex);
        }
    }

    public static void setField(Object target, String fieldName, Object value) {
        try {
            Field field = findField(target.getClass(), fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException("Cannot set " + fieldName + " on " + target.getClass().getName(), ex);
        }
    }

    private static Field findField(Class<?> type, String name) throws NoSuchFieldException {
        Class<?> current = type;
        while (current != null) {
            try {
                return current.getDeclaredField(name);
            } catch (NoSuchFieldException ignored) {
                current = current.getSuperclass();
            }
        }
        throw new NoSuchFieldException(name);
    }
}
