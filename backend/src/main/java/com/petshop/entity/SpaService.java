package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spa_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpaService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    // Thời gian thực hiện (phút)
    @Column(nullable = false)
    private Integer duration;

    // Loại thú cưng áp dụng
    @Enumerated(EnumType.STRING)
    @Column(name = "pet_type")
    @Builder.Default
    private Category.PetType petType = Category.PetType.ALL;

    // Bảng giá theo cân nặng
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServicePricing> pricingList = new ArrayList<>();

    // Đặt lịch
    @OneToMany(mappedBy = "service")
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper: Lấy giá theo cân nặng
    public BigDecimal getPriceForWeight(Double weight) {
        return pricingList.stream()
                .filter(p -> weight >= p.getMinWeight() && weight <= p.getMaxWeight())
                .map(ServicePricing::getPrice)
                .findFirst()
                .orElse(pricingList.isEmpty() ? BigDecimal.ZERO : 
                        pricingList.get(pricingList.size() - 1).getPrice());
    }
}
