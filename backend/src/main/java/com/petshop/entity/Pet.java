package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    // Loại thú cưng
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetType type;

    // Giống
    @Column(length = 100)
    private String breed;

    // Cân nặng (kg)
    private Double weight;

    // Tuổi (tháng hoặc năm)
    private String age;

    // Ghi chú đặc biệt
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Ảnh
    private String image;

    // Chủ sở hữu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Lịch sử đặt lịch spa
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PetType {
        DOG, CAT, BIRD, FISH, HAMSTER, RABBIT, OTHER
    }

    @Builder.Default
    @Column(name = "is_active")
    private Boolean active = true;
}
