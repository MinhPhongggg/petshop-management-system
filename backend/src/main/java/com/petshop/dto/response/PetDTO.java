package com.petshop.dto.response;

import com.petshop.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetDTO {
    
    private Long id;
    private String name;
    private Category.PetType petType;
    private String breed;
    private LocalDate birthDate;
    private String age;
    private String gender;
    private Double weight;
    private String color;
    private String avatarUrl;
    private String notes;
    private Long ownerId;
    private String ownerName;
    private Boolean active;
    private Integer bookingCount;
    private LocalDateTime createdAt;
}
