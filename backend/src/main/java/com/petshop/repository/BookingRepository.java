package com.petshop.repository;

import com.petshop.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByBookingCode(String bookingCode);
    
    // Lịch hẹn của user
    Page<Booking> findByUserIdOrderByBookingDateDescStartTimeDesc(Long userId, Pageable pageable);
    
    // Lịch hẹn trong ngày
    List<Booking> findByBookingDateAndStatusNotOrderByStartTimeAsc(LocalDate date, Booking.BookingStatus status);
    
    // Lịch hẹn trong ngày (admin)
    @Query("SELECT b FROM Booking b WHERE b.bookingDate = :date AND b.status != 'CANCELLED' ORDER BY b.startTime")
    List<Booking> findByDate(@Param("date") LocalDate date);
    
    // Kiểm tra khung giờ đã được đặt chưa
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.bookingDate = :date " +
           "AND b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND ((b.startTime <= :startTime AND b.endTime > :startTime) " +
           "OR (b.startTime < :endTime AND b.endTime >= :endTime) " +
           "OR (b.startTime >= :startTime AND b.endTime <= :endTime))")
    boolean existsConflictingBooking(@Param("date") LocalDate date,
                                     @Param("startTime") LocalTime startTime,
                                     @Param("endTime") LocalTime endTime);
    
    // Đếm số lịch hẹn trong ngày
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate = :date AND b.status NOT IN ('CANCELLED', 'NO_SHOW')")
    Long countByDate(@Param("date") LocalDate date);
    
    // Lịch hẹn theo trạng thái
    Page<Booking> findByStatusOrderByBookingDateDescStartTimeDesc(Booking.BookingStatus status, Pageable pageable);
    
    // Đếm theo trạng thái
    Long countByStatus(Booking.BookingStatus status);
    
    // Tổng doanh thu từ booking
    @Query("SELECT COALESCE(SUM(b.price), 0) FROM Booking b " +
           "WHERE b.status = 'COMPLETED' AND b.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenue(@Param("startDate") LocalDateTime startDate, 
                               @Param("endDate") LocalDateTime endDate);
    
    // Count bookings by date range
    Long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Count bookings by status and date range
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.createdAt BETWEEN :startDate AND :endDate")
    Long countByStatusAndCreatedAtBetween(@Param("status") Booking.BookingStatus status,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    // Recent bookings for dashboard
    List<Booking> findTop5ByOrderByCreatedAtDesc();
}
