package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDTO {
    
    private Long id;
    private Long productId;
    private String productName;
    private String name;
    private String sku;
    private BigDecimal price;
    private int stock;
    private boolean active;
}
