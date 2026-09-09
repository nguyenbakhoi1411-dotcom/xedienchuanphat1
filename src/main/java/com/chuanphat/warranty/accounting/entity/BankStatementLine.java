package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_statement_lines")
public class BankStatementLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statement_id", nullable = false)
    private BankStatement statement;

    @Column(nullable = false)
    private LocalDate ngayGiaoDich;

    @Column(length = 100)
    private String soThamChieu;

    @Column(length = 500)
    private String moTa;

    @Column(precision = 18, scale = 2)
    private BigDecimal soTienThu = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal soTienChi = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal soDuSau;

    @Column(length = 20)
    private String trangThaiDoiChieu = "UNMATCHED"; // UNMATCHED, MATCHED, IGNORED

    private Long bankTransactionId;

    // ── Getters and Setters ──

    public Long getId() { return id; }

    public BankStatement getStatement() { return statement; }
    public void setStatement(BankStatement statement) { this.statement = statement; }

    public LocalDate getNgayGiaoDich() { return ngayGiaoDich; }
    public void setNgayGiaoDich(LocalDate ngayGiaoDich) { this.ngayGiaoDich = ngayGiaoDich; }

    public String getSoThamChieu() { return soThamChieu; }
    public void setSoThamChieu(String soThamChieu) { this.soThamChieu = soThamChieu; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public BigDecimal getSoTienThu() { return soTienThu; }
    public void setSoTienThu(BigDecimal soTienThu) { this.soTienThu = soTienThu; }

    public BigDecimal getSoTienChi() { return soTienChi; }
    public void setSoTienChi(BigDecimal soTienChi) { this.soTienChi = soTienChi; }

    public BigDecimal getSoDuSau() { return soDuSau; }
    public void setSoDuSau(BigDecimal soDuSau) { this.soDuSau = soDuSau; }

    public String getTrangThaiDoiChieu() { return trangThaiDoiChieu; }
    public void setTrangThaiDoiChieu(String trangThaiDoiChieu) { this.trangThaiDoiChieu = trangThaiDoiChieu; }

    public Long getBankTransactionId() { return bankTransactionId; }
    public void setBankTransactionId(Long bankTransactionId) { this.bankTransactionId = bankTransactionId; }
}
