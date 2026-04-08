package com.petshop.dto.response;

import com.petshop.entity.StockMovement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDTO {
    
    private Long id;
    
    private Long variantId;
    private String productName;
    private String variantName;
    
    private StockMovement.MovementType movementType;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String note;
    
    private Long orderId;
    private String orderCode;
    
    private Long createdById;
    private String createdByName;
    
    private LocalDateTime createdAt;
}
