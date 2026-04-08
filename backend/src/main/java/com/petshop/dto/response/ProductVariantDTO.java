package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    private String barcode;
    private String unit;
    private BigDecimal price;
    private BigDecimal lastImportPrice;
    private BigDecimal averageCost;
    private int stock;
    private int minStock;
    private Integer maxStock;
    private LocalDate expiryDate;
    private boolean active;
}
