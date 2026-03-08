package com.petshop.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO để import sản phẩm từ Excel
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImportDTO {
    
    private int rowNumber;
    
    private String name;
    
    private String shortDescription;
    
    private String description;
    
    private String categoryName;
    
    private String brandName;
    
    private BigDecimal basePrice;
    
    private BigDecimal salePrice;
    
    private String variantName;
    
    private String variantSku;
    
    private BigDecimal variantPrice;
    
    private Integer variantStock;
    
    private String imageUrl;
    
    private Boolean featured;
    
    // Validation errors
    private String errorMessage;
    
    @Builder.Default
    private boolean valid = true;
    
    public void addError(String error) {
        this.valid = false;
        if (this.errorMessage == null) {
            this.errorMessage = error;
        } else {
            this.errorMessage += "; " + error;
        }
    }
}
