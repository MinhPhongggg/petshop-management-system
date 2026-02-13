package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "service_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private SpaService service;

    // Loại thú cưng
    @Enumerated(EnumType.STRING)
    private Pet.PetType petType;

    // Cân nặng tối thiểu (kg)
    @Column(name = "min_weight", nullable = false)
    private Double minWeight;

    // Cân nặng tối đa (kg)
    @Column(name = "max_weight", nullable = false)
    private Double maxWeight;

    // Giá dịch vụ
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
}
