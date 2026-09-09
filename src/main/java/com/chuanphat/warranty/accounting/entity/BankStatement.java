package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bank_statements")
public class BankStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @Column(length = 255)
    private String tenFile;

    @Column(length = 100)
    private String nganHang; // VCB, TCB, MB, BIDV, ACB...

    @Column(nullable = false)
    private LocalDate tuNgay;

    @Column(nullable = false)
    private LocalDate denNgay;

    @Column(precision = 18, scale = 2)
    private BigDecimal soDuDauSaoKe;

    @Column(precision = 18, scale = 2)
    private BigDecimal soDuCuoiSaoKe;

    private int tongSoDong = 0;

    private int soDongDaDoiChieu = 0;

    @Column(length = 20)
    private String trangThai = "PROCESSING"; // PROCESSING, COMPLETED, ERROR

    @Column(nullable = false)
    private OffsetDateTime ngayImport = OffsetDateTime.now();

    private String importedBy;

    @OneToMany(mappedBy = "statement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BankStatementLine> lines = new ArrayList<>();

    // ── Getters and Setters ──

    public Long getId() { return id; }

    public BankAccount getBankAccount() { return bankAccount; }
    public void setBankAccount(BankAccount bankAccount) { this.bankAccount = bankAccount; }

    public String getTenFile() { return tenFile; }
    public void setTenFile(String tenFile) { this.tenFile = tenFile; }

    public String getNganHang() { return nganHang; }
    public void setNganHang(String nganHang) { this.nganHang = nganHang; }

    public LocalDate getTuNgay() { return tuNgay; }
    public void setTuNgay(LocalDate tuNgay) { this.tuNgay = tuNgay; }

    public LocalDate getDenNgay() { return denNgay; }
    public void setDenNgay(LocalDate denNgay) { this.denNgay = denNgay; }

    public BigDecimal getSoDuDauSaoKe() { return soDuDauSaoKe; }
    public void setSoDuDauSaoKe(BigDecimal soDuDauSaoKe) { this.soDuDauSaoKe = soDuDauSaoKe; }

    public BigDecimal getSoDuCuoiSaoKe() { return soDuCuoiSaoKe; }
    public void setSoDuCuoiSaoKe(BigDecimal soDuCuoiSaoKe) { this.soDuCuoiSaoKe = soDuCuoiSaoKe; }

    public int getTongSoDong() { return tongSoDong; }
    public void setTongSoDong(int tongSoDong) { this.tongSoDong = tongSoDong; }

    public int getSoDongDaDoiChieu() { return soDongDaDoiChieu; }
    public void setSoDongDaDoiChieu(int soDongDaDoiChieu) { this.soDongDaDoiChieu = soDongDaDoiChieu; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public OffsetDateTime getNgayImport() { return ngayImport; }

    public String getImportedBy() { return importedBy; }
    public void setImportedBy(String importedBy) { this.importedBy = importedBy; }

    public List<BankStatementLine> getLines() { return lines; }
}
