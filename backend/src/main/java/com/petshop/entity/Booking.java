package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã booking (Ví dụ: BK-20260131-001)
    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private SpaService service;

    // Ngày hẹn
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    // Giờ bắt đầu
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    // Giờ kết thúc dự kiến
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // Cân nặng pet lúc đặt lịch (để tính giá)
    @Column(name = "pet_weight")
    private Double petWeight;

    // Giá dịch vụ
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    // Ghi chú của khách hàng
    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    // Ghi chú của nhân viên
    @Column(name = "staff_note", columnDefinition = "TEXT")
    private String staffNote;

    // Nhân viên phục vụ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

    // Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // Lý do hủy
    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    // Thời gian xác nhận
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    // Thời gian hoàn thành
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Đánh giá
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Review review;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING,        // Chờ xác nhận
        CONFIRMED,      // Đã xác nhận
        IN_PROGRESS,    // Đang thực hiện
        COMPLETED,      // Hoàn thành
        CANCELLED,      // Đã hủy
        NO_SHOW         // Khách không đến
    }
}
