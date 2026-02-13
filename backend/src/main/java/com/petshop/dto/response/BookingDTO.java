package com.petshop.dto.response;

import com.petshop.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    
    private Long id;
    private String bookingCode;
    
    // Thông tin khách hàng
    private Long userId;
    private String userName;
    private String userPhone;
    private String userEmail;
    
    // Thông tin thú cưng
    private Long petId;
    private String petName;
    private String petType;
    private String petBreed;
    private Double petWeight;
    private String petAvatar;
    
    // Thông tin dịch vụ
    private Long serviceId;
    private String serviceName;
    private Integer duration;
    
    // Lịch hẹn
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    
    // Giá
    private BigDecimal price;
    
    // Ghi chú
    private String customerNote;
    private String staffNote;
    
    // Nhân viên
    private Long staffId;
    private String staffName;
    
    // Trạng thái
    private Booking.BookingStatus status;
    private String cancelReason;
    
    // Review
    private Boolean reviewed;
    
    // Thời gian
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
