package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.InvoiceSerialConfig;
import com.chuanphat.warranty.accounting.repository.InvoiceSerialConfigRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class InvoiceNumberingServiceTest {

    @Autowired
    private InvoiceNumberingService numberingService;

    @Autowired
    private InvoiceSerialConfigRepository configRepository;

    private Long configId;

    @BeforeEach
    void setUp() {
        InvoiceSerialConfig config = new InvoiceSerialConfig();
        config.setMauSo("1");
        config.setKyHieu("C26TAA");
        config.setNamSuDung(2026);
        config.setSoBatDau(1);
        config.setSoHienTai(0);
        config.setSoKetThuc(9999999);
        config.setTrangThai("ACTIVE");
        InvoiceSerialConfig saved = configRepository.save(config);
        configId = saved.getId();
    }

    @AfterEach
    void tearDown() {
        configRepository.deleteById(configId);
    }

    @Test
    void testConcurrentGenerateNextInvoiceNo() throws InterruptedException {
        int numberOfThreads = 50;
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        Set<String> generatedNumbers = Collections.newSetFromMap(new ConcurrentHashMap<>());

        for (int i = 0; i < numberOfThreads; i++) {
            executorService.execute(() -> {
                try {
                    String invoiceNo = numberingService.generateNextInvoiceNo("1", "C26TAA", 2026);
                    generatedNumbers.add(invoiceNo);
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(30, TimeUnit.SECONDS);
        executorService.shutdown();

        // Kiểm tra xem số lượng mã được tạo ra có đúng bằng số thread không (chứng tỏ không bị trùng)
        assertThat(generatedNumbers).hasSize(numberOfThreads);

        // Kiểm tra config cuối cùng có số hiện tại bằng với số thread đã chạy
        InvoiceSerialConfig finalConfig = configRepository.findById(configId).orElseThrow();
        assertThat(finalConfig.getSoHienTai()).isEqualTo(numberOfThreads);
    }
}
