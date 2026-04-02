package com.petshop.config;

import com.petshop.entity.Booking;
import com.petshop.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class DepositExpirationScheduler {

    private final BookingRepository bookingRepository;

    /**
     * Chạy mỗi 2 phút: quét các booking DEPOSIT_PENDING đã hết hạn
     * và tự động hủy, giải phóng khung giờ.
     */
    @Scheduled(fixedRate = 120_000) // 2 phút
    @Transactional
    public void expireUnpaidDeposits() {
        List<Booking> expiredBookings = bookingRepository
                .findByStatusAndDepositExpiresAtBefore(
                        Booking.BookingStatus.DEPOSIT_PENDING, LocalDateTime.now());

        for (Booking booking : expiredBookings) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            booking.setDepositStatus(Booking.DepositStatus.EXPIRED);
            booking.setCancelReason("Hết thời hạn thanh toán cọc (" + 
                    booking.getDepositExpiresAt() + ")");
            bookingRepository.save(booking);

            log.info("Booking {} expired - deposit not paid within timeout. Slot released.",
                    booking.getBookingCode());
        }

        if (!expiredBookings.isEmpty()) {
            log.info("Expired {} unpaid deposit bookings", expiredBookings.size());
        }
    }
}
