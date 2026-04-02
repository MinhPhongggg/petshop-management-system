package com.petshop.config;

import com.petshop.service.SpaReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "petshop.reminder.enabled", havingValue = "true", matchIfMissing = true)
public class SpaReminderScheduler {

    private final SpaReminderService spaReminderService;

    /**
     * Tự động gửi email nhắc nhở spa mỗi ngày lúc 9h sáng.
     * Cron expression được config trong application.yml
     */
    @Scheduled(cron = "${petshop.reminder.cron:0 0 9 * * *}")
    public void scheduleSpaReminders() {
        log.info("⏰ [Scheduler] Bắt đầu job nhắc nhở spa tự động...");
        try {
            int sentCount = spaReminderService.sendSpaReminders();
            log.info("⏰ [Scheduler] Hoàn tất - Đã gửi {} email nhắc nhở", sentCount);
        } catch (Exception e) {
            log.error("⏰ [Scheduler] Lỗi khi chạy job nhắc nhở: {}", e.getMessage(), e);
        }
    }
}
