package com.petshop.controller;

import com.petshop.dto.response.SpaReminderLogDTO;
import com.petshop.service.SpaReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/spa-reminders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SpaReminderController {

    private final SpaReminderService spaReminderService;

    /**
     * Chạy gửi nhắc nhở thủ công (Admin trigger)
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> triggerReminders() {
        int sentCount = spaReminderService.sendSpaReminders();
        return ResponseEntity.ok(Map.of(
            "message", "Đã gửi " + sentCount + " email nhắc nhở",
            "sentCount", sentCount
        ));
    }

    /**
     * Gửi nhắc nhở cho 1 booking cụ thể
     */
    @PostMapping("/send/{bookingId}")
    public ResponseEntity<Map<String, String>> sendManualReminder(@PathVariable Long bookingId) {
        spaReminderService.sendManualReminder(bookingId);
        return ResponseEntity.ok(Map.of("message", "Đã gửi email nhắc nhở thành công"));
    }

    /**
     * Xem lịch sử nhắc nhở
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<SpaReminderLogDTO>> getReminderLogs(
            @PageableDefault(size = 20, sort = "sentAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(spaReminderService.getReminderLogs(pageable));
    }

    /**
     * Thống kê nhắc nhở
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getReminderStats() {
        return ResponseEntity.ok(spaReminderService.getReminderStats());
    }

    /**
     * Danh sách khách hàng đủ điều kiện nhận nhắc nhở
     */
    @GetMapping("/eligible")
    public ResponseEntity<java.util.List<Map<String, Object>>> getEligibleBookings() {
        return ResponseEntity.ok(spaReminderService.getEligibleBookings());
    }
}
