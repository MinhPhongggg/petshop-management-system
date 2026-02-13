package com.petshop.service;

import com.petshop.dto.request.BookingRequest;
import com.petshop.dto.response.BookingDTO;
import com.petshop.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingService {
    
    // Đặt lịch
    BookingDTO createBooking(BookingRequest request);
    
    // Kiểm tra khung giờ trống
    boolean isTimeSlotAvailable(LocalDate date, LocalTime startTime, LocalTime endTime);
    
    // Lấy thông tin booking
    BookingDTO getBookingById(Long id);
    BookingDTO getBookingByCode(String bookingCode);
    
    // Danh sách booking của user
    Page<BookingDTO> getMyBookings(Pageable pageable);
    
    // Hủy booking (user)
    BookingDTO cancelBooking(Long id, String reason);
    
    // === Admin/Staff ===
    // Lấy lịch hẹn trong ngày
    List<BookingDTO> getBookingsByDate(LocalDate date);
    
    // Lấy tất cả booking
    Page<BookingDTO> getAllBookings(Pageable pageable);
    Page<BookingDTO> getBookingsByStatus(Booking.BookingStatus status, Pageable pageable);
    
    // Xác nhận/Hoàn thành/Hủy
    BookingDTO confirmBooking(Long id);
    BookingDTO startBooking(Long id);
    BookingDTO completeBooking(Long id, String staffNote);
    BookingDTO adminCancelBooking(Long id, String reason);
    BookingDTO markNoShow(Long id);
    
    // Assign nhân viên
    BookingDTO assignStaff(Long id, Long staffId);
}
