package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.InvoiceSerialConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceSerialConfigRepository extends JpaRepository<InvoiceSerialConfig, Long> {
    Optional<InvoiceSerialConfig> findByMauSoAndKyHieuAndNamSuDung(String mauSo, String kyHieu, Integer namSuDung);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT c FROM InvoiceSerialConfig c WHERE c.mauSo = :mauSo AND c.kyHieu = :kyHieu AND c.namSuDung = :namSuDung")
    Optional<InvoiceSerialConfig> findByMauSoAndKyHieuAndNamSuDungWithLock(
            @org.springframework.data.repository.query.Param("mauSo") String mauSo,
            @org.springframework.data.repository.query.Param("kyHieu") String kyHieu,
            @org.springframework.data.repository.query.Param("namSuDung") Integer namSuDung);
}
