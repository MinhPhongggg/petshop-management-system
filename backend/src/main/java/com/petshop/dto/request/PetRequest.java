package com.petshop.dto.request;

import com.petshop.entity.Pet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PetRequest {
    
    @NotBlank(message = "Tên thú cưng là bắt buộc")
    private String name;
    
    @NotNull(message = "Loại thú cưng là bắt buộc")
    private Pet.PetType type;
    
    private String breed;
    
    private Double weight;
    
    private String age;
    
    private String notes;
    
    private String image;
}
