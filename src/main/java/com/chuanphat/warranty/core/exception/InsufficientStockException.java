package com.chuanphat.warranty.core.exception;

import java.util.List;
import java.util.Map;

public class InsufficientStockException extends RuntimeException {
    private final List<Map<String, Object>> suggestions;
    private final String productName;
    private final int required;
    private final int available;

    public InsufficientStockException(String message, String productName, int required, int available, List<Map<String, Object>> suggestions) {
        super(message);
        this.productName = productName;
        this.required = required;
        this.available = available;
        this.suggestions = suggestions;
    }

    public List<Map<String, Object>> getSuggestions() { return suggestions; }
    public String getProductName() { return productName; }
    public int getRequired() { return required; }
    public int getAvailable() { return available; }
}
