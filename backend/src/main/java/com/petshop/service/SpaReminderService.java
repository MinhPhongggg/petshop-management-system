package com.petshop.service;

import com.petshop.dto.response.SpaReminderLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface SpaReminderService {

    /**
     * Gửi email nhắc nhở spa cho khách hàng đủ điều kiện
     * @return số email đã gửi thành công
     */
    int sendSpaReminders();

    /**
     * Gửi email nhắc nhở thủ công cho 1 booking cụ thể (Admin)
     */
    void sendManualReminder(Long bookingId);

    /**
     * Lấy danh sách log nhắc nhở (Admin)
     */
    Page<SpaReminderLogDTO> getReminderLogs(Pageable pageable);

    /**
     * Thống kê nhắc nhở
     */
    Map<String, Object> getReminderStats();

    /**
     * Lấy danh sách booking đủ điều kiện nhắc nhở
     */
    List<Map<String, Object>> getEligibleBookings();
}
