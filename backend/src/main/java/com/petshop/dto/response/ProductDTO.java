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
public class ProductDTO {
    
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private String description;
    private String shortDescription;
    
    private Long categoryId;
    private String categoryName;
    private String categoryPath;
    
    private Long brandId;
    private String brandName;
    
    private Category.PetType petType;
    
    // Ảnh
    private String primaryImage;
    private List<ProductImageDTO> images;
    
    // Biến thể
    private List<ProductVariantDTO> variants;
    
    // Giá
    private BigDecimal basePrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    
    private Boolean hasDiscount;
    
    // Thống kê
    private BigDecimal averageRating;
    private Integer reviewCount;
    private Integer soldCount;
    private Integer viewCount;
    private Integer totalStock;
    
    private Boolean featured;
    private Boolean active;
    private Boolean inStock;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
