package com.petshop.repository;

import com.petshop.entity.SpaReminderLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SpaReminderLogRepository extends JpaRepository<SpaReminderLog, Long> {

    // Kiểm tra đã gửi nhắc nhở cho booking này chưa
    boolean existsByBookingId(Long bookingId);

    // Lấy danh sách reminder logs (admin)
    Page<SpaReminderLog> findAllByOrderBySentAtDesc(Pageable pageable);

    // Thống kê
    Long countBySentAtBetween(LocalDateTime start, LocalDateTime end);
    
    Long countByStatus(SpaReminderLog.ReminderStatus status);

    @Query("SELECT COUNT(r) FROM SpaReminderLog r WHERE r.status = :status AND r.sentAt BETWEEN :start AND :end")
    Long countByStatusAndSentAtBetween(@Param("status") SpaReminderLog.ReminderStatus status,
                                       @Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);
}
