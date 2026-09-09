package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bank_transaction_items")
public class BankTransactionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private BankTransaction transaction;

    @Column(length = 500)
    private String dienGiai;

    @Column(length = 10, nullable = false)
    private String tkNo;

    @Column(length = 10, nullable = false)
    private String tkCo;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal soTien;

    // Đối tượng của từng dòng chi tiết (có thể khác với đối tượng chung của Header)
    private Long doiTuongId;

    @Column(length = 20)
    private String loaiDoiTuong; // CUSTOMER, SUPPLIER, EMPLOYEE, OTHER

    @Column(length = 255)
    private String tenDoiTuong;

    // Getter & Setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BankTransaction getTransaction() {
        return transaction;
    }

    public void setTransaction(BankTransaction transaction) {
        this.transaction = transaction;
    }

    public String getDienGiai() {
        return dienGiai;
    }

    public void setDienGiai(String dienGiai) {
        this.dienGiai = dienGiai;
    }

    public String getTkNo() {
        return tkNo;
    }

    public void setTkNo(String tkNo) {
        this.tkNo = tkNo;
    }

    public String getTkCo() {
        return tkCo;
    }

    public void setTkCo(String tkCo) {
        this.tkCo = tkCo;
    }

    public BigDecimal getSoTien() {
        return soTien;
    }

    public void setSoTien(BigDecimal soTien) {
        this.soTien = soTien;
    }

    public Long getDoiTuongId() {
        return doiTuongId;
    }

    public void setDoiTuongId(Long doiTuongId) {
        this.doiTuongId = doiTuongId;
    }

    public String getLoaiDoiTuong() {
        return loaiDoiTuong;
    }

    public void setLoaiDoiTuong(String loaiDoiTuong) {
        this.loaiDoiTuong = loaiDoiTuong;
    }

    public String getTenDoiTuong() {
        return tenDoiTuong;
    }

    public void setTenDoiTuong(String tenDoiTuong) {
        this.tenDoiTuong = tenDoiTuong;
    }
}
