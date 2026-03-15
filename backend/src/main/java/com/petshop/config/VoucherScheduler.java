package com.petshop.config;

import com.petshop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VoucherScheduler {

    private final VoucherService voucherService;

    /**
     * Chạy mỗi ngày lúc 8:00 sáng
     * Kiểm tra sinh nhật thú cưng và tạo voucher tri ân (LOYALTY)
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void generateDailyBirthdayVouchers() {
        log.info("=== [Scheduler] Bắt đầu kiểm tra sinh nhật thú cưng ===");
        try {
            voucherService.generateBirthdayVouchers();
            log.info("=== [Scheduler] Hoàn tất kiểm tra sinh nhật ===");
        } catch (Exception e) {
            log.error("=== [Scheduler] Lỗi khi tạo voucher sinh nhật: {} ===", e.getMessage(), e);
        }
    }
}
