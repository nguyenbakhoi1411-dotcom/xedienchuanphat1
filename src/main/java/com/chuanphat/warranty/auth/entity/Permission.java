package com.chuanphat.warranty.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String code;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(nullable = false, length = 50)
    private String action;

    protected Permission() {
    }

    public Permission(String code, String module, String action) {
        this.code = code;
        this.module = module;
        this.action = action;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getModule() {
        return module;
    }

    public String getAction() {
        return action;
    }
}
