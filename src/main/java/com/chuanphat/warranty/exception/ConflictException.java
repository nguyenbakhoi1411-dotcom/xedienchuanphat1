package com.chuanphat.warranty.exception;

/**
 * Nem khi du lieu bi trung lap (409 Conflict).
 * Vi du: frameNumber trung, serialNumber trung.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
