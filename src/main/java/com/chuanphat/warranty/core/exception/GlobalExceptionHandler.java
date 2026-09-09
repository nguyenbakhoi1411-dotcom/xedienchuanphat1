package com.chuanphat.warranty.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientStockException(InsufficientStockException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "INSUFFICIENT_STOCK");
        body.put("message", ex.getMessage());
        body.put("productName", ex.getProductName());
        body.put("required", ex.getRequired());
        body.put("available", ex.getAvailable());
        body.put("suggestions", ex.getSuggestions());

        return new ResponseEntity<>(body, HttpStatus.CONFLICT); // 409 Conflict
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "ILLEGAL_STATE");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
