package com.petshop.dto.request;

import com.petshop.entity.StockMovement;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockMovementRequest {
    
    @NotNull(message = "Variant ID is required")
    private Long variantId;
    
    @NotNull(message = "Movement type is required")
    private StockMovement.MovementType movementType;
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    private String note;
}
