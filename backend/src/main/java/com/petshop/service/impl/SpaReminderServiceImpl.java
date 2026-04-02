package com.petshop.service.impl;

import com.petshop.dto.response.SpaReminderLogDTO;
import com.petshop.entity.*;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.BookingRepository;
import com.petshop.repository.SpaReminderLogRepository;
import com.petshop.service.SpaReminderService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpaReminderServiceImpl implements SpaReminderService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final BookingRepository bookingRepository;
    private final SpaReminderLogRepository reminderLogRepository;

    @Value("${petshop.reminder.from-email:petshop.notification@gmail.com}")
    private String fromEmail;

    @Value("${petshop.reminder.from-name:PetShop Spa}")
    private String fromName;

    @Value("${petshop.reminder.booking-url:http://localhost:3000/booking}")
    private String bookingUrl;

    @Value("${petshop.reminder.default-days:14}")
    private int defaultReminderDays;

    @Value("${petshop.reminder.rules.dog-long-hair:14}")
    private int dogLongHairDays;

    @Value("${petshop.reminder.rules.dog-short-hair:21}")
    private int dogShortHairDays;

    @Value("${petshop.reminder.rules.cat:21}")
    private int catDays;

    // Danh sách tiêu đề email bắt mắt - sẽ xoay vòng
    private static final String[] SUBJECT_LINES = {
        "🐾 Boss %s đã lâu không được spa rồi, sen ơi!",
        "🛁 Đến lịch tắm gội cho %s rồi nè! Đặt ngay kẻo hết chỗ~",
        "✨ %s nhớ mùi thơm spa lắm rồi! Đặt lịch ngay sen ơi 💕"
    };

    @Override
    @Transactional
    public int sendSpaReminders() {
        log.info("🔔 Bắt đầu kiểm tra và gửi email nhắc nhở spa...");

        // Tìm bookings hoàn thành trong khoảng cần nhắc nhở
        // Lấy range rộng nhất: từ 35 ngày trước đến 7 ngày trước (đảm bảo cover tất cả rules)
        LocalDateTime endDate = LocalDateTime.now().minusDays(7);
        LocalDateTime startDate = LocalDateTime.now().minusDays(35);

        List<Booking> eligibleBookings = bookingRepository.findCompletedBookingsForReminder(
            startDate, endDate,
            startDate.toLocalDate(), endDate.toLocalDate()
        );
        log.info("📋 Tìm thấy {} booking đủ điều kiện nhắc nhở", eligibleBookings.size());

        int sentCount = 0;
        for (Booking booking : eligibleBookings) {
            try {
                int reminderDays = getReminderDays(booking.getPet());
                java.time.LocalDate completionDate = booking.getCompletedAt() != null
                    ? booking.getCompletedAt().toLocalDate()
                    : booking.getBookingDate();
                long daysSinceCompletion = ChronoUnit.DAYS.between(
                    completionDate,
                    java.time.LocalDate.now()
                );

                // Chỉ gửi nếu đã đủ số ngày theo quy tắc
                if (daysSinceCompletion >= reminderDays) {
                    sendReminderEmail(booking, (int) daysSinceCompletion);
                    sentCount++;
                }
            } catch (Exception e) {
                log.error("❌ Lỗi gửi nhắc nhở cho booking {}: {}", booking.getBookingCode(), e.getMessage());
                saveFailedLog(booking, e.getMessage());
            }
        }

        log.info("✅ Hoàn tất: Đã gửi {}/{} email nhắc nhở", sentCount, eligibleBookings.size());
        return sentCount;
    }

    @Override
    @Transactional
    public void sendManualReminder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new IllegalStateException("Chỉ có thể gửi nhắc nhở cho lịch hẹn đã hoàn thành");
        }

        if (reminderLogRepository.existsByBookingId(bookingId)) {
            throw new IllegalStateException("Đã gửi nhắc nhở cho lịch hẹn này rồi");
        }

        long daysSince = booking.getCompletedAt() != null
            ? ChronoUnit.DAYS.between(booking.getCompletedAt().toLocalDate(), LocalDateTime.now().toLocalDate())
            : ChronoUnit.DAYS.between(booking.getBookingDate(), LocalDateTime.now().toLocalDate());

        sendReminderEmail(booking, (int) daysSince);
    }

    @Override
    public Page<SpaReminderLogDTO> getReminderLogs(Pageable pageable) {
        return reminderLogRepository.findAllByOrderBySentAtDesc(pageable).map(this::mapToDTO);
    }

    @Override
    public Map<String, Object> getReminderStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = now.minusDays(7);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSent", reminderLogRepository.count());
        stats.put("sentThisMonth", reminderLogRepository.countBySentAtBetween(startOfMonth, now));
        stats.put("sentThisWeek", reminderLogRepository.countBySentAtBetween(startOfWeek, now));
        stats.put("totalFailed", reminderLogRepository.countByStatus(SpaReminderLog.ReminderStatus.FAILED));
        stats.put("successRate",
            reminderLogRepository.count() > 0
                ? (double) reminderLogRepository.countByStatus(SpaReminderLog.ReminderStatus.SENT) * 100
                  / reminderLogRepository.count()
                : 100.0
        );
        return stats;
    }

    // === Private Methods ===

    private void sendReminderEmail(Booking booking, int daysSinceLastVisit) {
        User user = booking.getUser();
        Pet pet = booking.getPet();
        SpaService service = booking.getService();

        // Chọn subject line xoay vòng dựa trên booking id
        String subject = String.format(
            SUBJECT_LINES[(int) (booking.getId() % SUBJECT_LINES.length)],
            pet.getName()
        );

        // Chuẩn bị context cho template
        Context context = new Context();
        context.setVariable("customerName", user.getFullName());
        context.setVariable("petName", pet.getName());
        context.setVariable("daysSinceLastVisit", daysSinceLastVisit);
        context.setVariable("lastServiceName", service.getName());
        context.setVariable("bookingUrl", bookingUrl + "?service=" + service.getId());
        context.setVariable("hasPromotion", true);
        context.setVariable("promotionText", "Giảm 10% khi đặt lịch hôm nay!");

        String htmlContent = templateEngine.process("spa-reminder-email", context);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);

            // Log success
            saveSuccessLog(booking, subject);
            log.info("📧 Đã gửi email nhắc nhở đến {} cho pet {} (booking: {})",
                user.getEmail(), pet.getName(), booking.getBookingCode());

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("❌ Lỗi gửi email đến {}: {}", user.getEmail(), e.getMessage());
            saveFailedLog(booking, e.getMessage());
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }

    private int getReminderDays(Pet pet) {
        if (pet.getType() == Pet.PetType.CAT) {
            return catDays;
        }
        if (pet.getType() == Pet.PetType.DOG) {
            String breed = pet.getBreed() != null ? pet.getBreed().toLowerCase() : "";
            // Giống chó lông dài phổ biến
            if (breed.contains("poodle") || breed.contains("shih tzu") ||
                breed.contains("maltese") || breed.contains("yorkshire") ||
                breed.contains("bichon") || breed.contains("cocker") ||
                breed.contains("golden") || breed.contains("samoyed") ||
                breed.contains("husky") || breed.contains("alaska") ||
                breed.contains("phốc sóc") || breed.contains("pomeranian") ||
                breed.contains("lông dài")) {
                return dogLongHairDays;
            }
            return dogShortHairDays;
        }
        return defaultReminderDays;
    }

    private void saveSuccessLog(Booking booking, String subject) {
        SpaReminderLog logEntry = SpaReminderLog.builder()
            .user(booking.getUser())
            .booking(booking)
            .pet(booking.getPet())
            .service(booking.getService())
            .emailTo(booking.getUser().getEmail())
            .subject(subject)
            .status(SpaReminderLog.ReminderStatus.SENT)
            .build();
        reminderLogRepository.save(logEntry);
    }

    private void saveFailedLog(Booking booking, String errorMessage) {
        SpaReminderLog logEntry = SpaReminderLog.builder()
            .user(booking.getUser())
            .booking(booking)
            .pet(booking.getPet())
            .service(booking.getService())
            .emailTo(booking.getUser().getEmail())
            .subject("Failed to send")
            .status(SpaReminderLog.ReminderStatus.FAILED)
            .errorMessage(errorMessage)
            .build();
        reminderLogRepository.save(logEntry);
    }

    @Override
    public List<Map<String, Object>> getEligibleBookings() {
        // Lấy tất cả booking COMPLETED chưa gửi nhắc nhở (không giới hạn ngày)
        List<Booking> bookings = bookingRepository.findAllCompletedNotReminded();

        return bookings.stream().map(booking -> {
            Pet pet = booking.getPet();
            User user = booking.getUser();
            int reminderDays = getReminderDays(pet);

            java.time.LocalDate completionDate = booking.getCompletedAt() != null
                ? booking.getCompletedAt().toLocalDate()
                : booking.getBookingDate();
            long daysSince = ChronoUnit.DAYS.between(completionDate, java.time.LocalDate.now());
            // Tất cả booking đã hoàn thành đều có thể gửi ngay
            boolean ready = true;
            // Gợi ý: đã đủ ngày theo quy tắc chưa
            boolean suggestedReady = daysSince >= reminderDays;

            Map<String, Object> item = new HashMap<>();
            item.put("bookingId", booking.getId());
            item.put("bookingCode", booking.getBookingCode());
            item.put("userId", user.getId());
            item.put("userName", user.getFullName());
            item.put("userEmail", user.getEmail());
            item.put("userPhone", user.getPhone());
            item.put("petId", pet.getId());
            item.put("petName", pet.getName());
            item.put("petType", pet.getType() != null ? pet.getType().name() : null);
            item.put("petBreed", pet.getBreed());
            item.put("serviceName", booking.getService().getName());
            item.put("bookingDate", booking.getBookingDate().toString());
            item.put("completedAt", booking.getCompletedAt() != null ? booking.getCompletedAt().toString() : null);
            item.put("daysSinceCompletion", daysSince);
            item.put("reminderDays", reminderDays);
            item.put("ready", ready);
            item.put("suggestedReady", suggestedReady);
            return item;
        }).collect(java.util.stream.Collectors.toList());
    }

    private SpaReminderLogDTO mapToDTO(SpaReminderLog entity) {
        return SpaReminderLogDTO.builder()
            .id(entity.getId())
            .userId(entity.getUser().getId())
            .userName(entity.getUser().getFullName())
            .userEmail(entity.getUser().getEmail())
            .petId(entity.getPet().getId())
            .petName(entity.getPet().getName())
            .petType(entity.getPet().getType() != null ? entity.getPet().getType().name() : null)
            .serviceId(entity.getService().getId())
            .serviceName(entity.getService().getName())
            .bookingCode(entity.getBooking().getBookingCode())
            .subject(entity.getSubject())
            .status(entity.getStatus())
            .errorMessage(entity.getErrorMessage())
            .sentAt(entity.getSentAt())
            .build();
    }
}
