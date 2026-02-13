package com.petshop.dto.response;

import com.petshop.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpaServiceDTO {
    
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer duration;
    private Category.PetType petType;
    private Integer displayOrder;
    private Boolean active;
    
    // Bảng giá
    private List<ServicePricingDTO> pricingList;
    
    // Giá thấp nhất - cao nhất
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    
    private LocalDateTime createdAt;
}
