package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByMaHoaDon(String maHoaDon);
    Optional<Invoice> findByMauSoAndKyHieuAndSoHoaDon(String mauSo, String kyHieu, String soHoaDon);
    List<Invoice> findByLoaiHoaDonAndNgayXuatBetweenAndChiNhanhId(String loaiHoaDon, java.time.LocalDate startDate, java.time.LocalDate endDate, Long chiNhanhId);
}
