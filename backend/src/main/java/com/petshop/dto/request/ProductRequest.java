package com.petshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    
    @NotBlank(message = "Tên sản phẩm là bắt buộc")
    private String name;
    
    @NotBlank(message = "Slug là bắt buộc")
    private String slug;
    
    private String description;
    
    private String shortDescription;
    
    @NotNull(message = "Danh mục là bắt buộc")
    private Long categoryId;
    
    private Long brandId;
    
    private BigDecimal basePrice;
    
    private BigDecimal salePrice;
    
    private boolean featured = false;
    
    // Danh sách biến thể
    private List<VariantRequest> variants;
    
    // Danh sách ảnh
    private List<ImageRequest> images;
    
    @Data
    public static class VariantRequest {
        @NotBlank(message = "Tên biến thể là bắt buộc")
        private String name;
        
        private String sku;
        
        @NotNull(message = "Giá là bắt buộc")
        private BigDecimal price;
        
        private int stock = 0;
    }
    
    @Data
    public static class ImageRequest {
        @NotBlank(message = "URL ảnh là bắt buộc")
        private String imageUrl;
        
        private boolean isPrimary = false;
        
        private int sortOrder = 0;
    }
}
