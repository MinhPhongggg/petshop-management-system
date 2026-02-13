package com.petshop.dto.request;

import com.petshop.entity.Pet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SpaServiceRequest {
    
    @NotBlank(message = "Tên dịch vụ là bắt buộc")
    private String name;
    
    @NotBlank(message = "Slug là bắt buộc")
    private String slug;
    
    private String description;
    
    private String image;
    
    @NotNull(message = "Thời lượng là bắt buộc")
    private Integer duration;
    
    // Bảng giá theo cân nặng
    private List<PricingRequest> pricings;
    
    @Data
    public static class PricingRequest {
        private Pet.PetType petType;
        
        @NotNull(message = "Cân nặng tối thiểu là bắt buộc")
        private Double minWeight;
        
        @NotNull(message = "Cân nặng tối đa là bắt buộc")
        private Double maxWeight;
        
        @NotNull(message = "Giá là bắt buộc")
        private BigDecimal price;
    }
}
