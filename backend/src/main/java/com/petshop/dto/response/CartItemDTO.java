package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    
    private Long id;
    
    // Thông tin sản phẩm
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImage;
    
    // Thông tin biến thể
    private Long variantId;
    private String variantName;
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal currentPrice;
    private Integer stockQuantity;
    private Boolean inStock;
    
    // Số lượng & tổng tiền
    private Integer quantity;
    private BigDecimal subtotal;
    
    private LocalDateTime createdAt;
}
