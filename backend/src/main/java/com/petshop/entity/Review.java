package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Đánh giá sản phẩm (nullable nếu là đánh giá booking)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // Đánh giá dịch vụ spa (nullable nếu là đánh giá sản phẩm)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Đánh giá từ order item nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    // Số sao (1-5)
    @Column(nullable = false)
    private Integer rating;

    // Nội dung đánh giá
    @Column(columnDefinition = "TEXT")
    private String content;

    // Ảnh đánh giá
    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    // Phản hồi từ shop
    @Column(name = "shop_reply", columnDefinition = "TEXT")
    private String shopReply;

    @Column(name = "reply_at")
    private LocalDateTime replyAt;

    // Hiển thị công khai
    @Column(nullable = false)
    @Builder.Default
    private Boolean visible = true;

    // Admin ẩn review (spam/vi phạm)
    @Column(nullable = false)
    @Builder.Default
    private Boolean hidden = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
