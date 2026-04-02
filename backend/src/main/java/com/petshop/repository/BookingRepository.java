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
    
    // ==================== ANALYTICS QUERIES ====================
    
    // Thống kê booking theo giờ trong ngày (tỷ lệ lấp đầy)
    @Query(value = "SELECT HOUR(start_time) as hour, COUNT(*) as cnt " +
                   "FROM bookings WHERE status NOT IN ('CANCELLED', 'NO_SHOW') " +
                   "AND booking_date BETWEEN :startDate AND :endDate " +
                   "GROUP BY HOUR(start_time) ORDER BY hour", nativeQuery = true)
    List<Object[]> countBookingsByHour(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
    
    // Thống kê booking theo ngày (7 ngày gần nhất)
    @Query(value = "SELECT booking_date, COUNT(*) as cnt " +
                   "FROM bookings WHERE status NOT IN ('CANCELLED', 'NO_SHOW') " +
                   "AND booking_date BETWEEN :startDate AND :endDate " +
                   "GROUP BY booking_date ORDER BY booking_date", nativeQuery = true)
    List<Object[]> countBookingsByDay(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);
    
    // Hiệu suất theo nhân viên (groomer) - số ca, doanh thu
    @Query(value = "SELECT b.staff_id, u.full_name, COUNT(*) as total_bookings, " +
                   "SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed, " +
                   "COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.price ELSE 0 END), 0) as revenue " +
                   "FROM bookings b JOIN users u ON b.staff_id = u.id " +
                   "WHERE b.staff_id IS NOT NULL " +
                   "AND b.booking_date BETWEEN :startDate AND :endDate " +
                   "GROUP BY b.staff_id, u.full_name ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getGroomerPerformance(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    // Dịch vụ phổ biến nhất - so sánh doanh thu giữa các dịch vụ
    @Query(value = "SELECT b.service_id, s.name, COUNT(*) as booking_count, " +
                   "COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.price ELSE 0 END), 0) as revenue " +
                   "FROM bookings b JOIN spa_services s ON b.service_id = s.id " +
                   "WHERE b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                   "AND b.booking_date BETWEEN :startDate AND :endDate " +
                   "GROUP BY b.service_id, s.name ORDER BY booking_count DESC", nativeQuery = true)
    List<Object[]> getPopularServices(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
    
    // Đếm booking hoàn thành
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'COMPLETED'")
    Long countCompleted();
    
    // Đếm booking bị hủy
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status IN ('CANCELLED', 'NO_SHOW')")
    Long countCancelled();
    
    // Chu kỳ chăm sóc - lấy tất cả booking của pet theo thời gian
    @Query(value = "SELECT b.user_id, u.full_name, p.name as pet_name, p.type as pet_type, " +
                   "COUNT(*) as total_visits, " +
                   "GROUP_CONCAT(b.booking_date ORDER BY b.booking_date SEPARATOR ',') as visit_dates " +
                   "FROM bookings b " +
                   "JOIN users u ON b.user_id = u.id " +
                   "JOIN pets p ON b.pet_id = p.id " +
                   "WHERE b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                   "GROUP BY b.user_id, u.full_name, p.id, p.name, p.type " +
                   "HAVING COUNT(*) >= 2 " +
                   "ORDER BY total_visits DESC", nativeQuery = true)
    List<Object[]> getCustomerRetentionData();
    
    // Rating trung bình theo nhân viên
    @Query(value = "SELECT b.staff_id, COALESCE(AVG(r.rating), 0) as avg_rating " +
                   "FROM bookings b LEFT JOIN reviews r ON r.booking_id = b.id " +
                   "WHERE b.staff_id IS NOT NULL AND r.id IS NOT NULL " +
                   "GROUP BY b.staff_id", nativeQuery = true)
    List<Object[]> getStaffAverageRatings();
    
    // VIP Pet - tổng chi tiêu dịch vụ theo pet
    @Query(value = "SELECT p.id as pet_id, p.name as pet_name, p.type as pet_type, p.breed, " +
                   "u.full_name as owner_name, COUNT(b.id) as total_bookings, " +
                   "COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.price ELSE 0 END), 0) as service_spending " +
                   "FROM pets p " +
                   "JOIN users u ON p.owner_id = u.id " +
                   "LEFT JOIN bookings b ON b.pet_id = p.id " +
                   "GROUP BY p.id, p.name, p.type, p.breed, u.full_name " +
                   "ORDER BY service_spending DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getVipPetServiceSpending();
    
    // Tìm bookings COMPLETED để gửi nhắc nhở spa
    // Hỗ trợ cả booking có completedAt và không có (fallback sang bookingDate)
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user u " +
           "JOIN FETCH b.pet p " +
           "JOIN FETCH b.service s " +
           "WHERE b.status = 'COMPLETED' " +
           "AND ((b.completedAt IS NOT NULL AND b.completedAt BETWEEN :startDate AND :endDate) " +
           "  OR (b.completedAt IS NULL AND b.bookingDate BETWEEN :startLocalDate AND :endLocalDate)) " +
           "AND u.active = true " +
           "AND NOT EXISTS (SELECT r FROM SpaReminderLog r WHERE r.booking.id = b.id) " +
           "AND NOT EXISTS (SELECT b2 FROM Booking b2 WHERE b2.user.id = b.user.id " +
           "    AND b2.pet.id = b.pet.id AND b2.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "    AND b2.bookingDate > b.bookingDate)")
    List<Booking> findCompletedBookingsForReminder(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate,
                                                    @Param("startLocalDate") LocalDate startLocalDate,
                                                    @Param("endLocalDate") LocalDate endLocalDate);
    // Tìm TẤT CẢ bookings COMPLETED chưa gửi nhắc nhở (dùng cho admin xem danh sách eligible)
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user u " +
           "JOIN FETCH b.pet p " +
           "JOIN FETCH b.service s " +
           "WHERE b.status = 'COMPLETED' " +
           "AND u.active = true " +
           "AND NOT EXISTS (SELECT r FROM SpaReminderLog r WHERE r.booking.id = b.id) " +
           "ORDER BY COALESCE(b.completedAt, CAST(b.bookingDate AS timestamp)) DESC")
    List<Booking> findAllCompletedNotReminded();}
