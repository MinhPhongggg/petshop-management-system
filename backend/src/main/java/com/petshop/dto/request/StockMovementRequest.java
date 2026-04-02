package com.petshop.dto.request;

import com.petshop.entity.StockMovement;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockMovementRequest {
    
    @NotNull(message = "Variant ID is required")
    private Long variantId;
    
    @NotNull(message = "Movement type is required")
    private StockMovement.MovementType movementType;
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;

    // Giá nhập theo chứng từ (dùng cho IMPORT để cập nhật giá vốn bình quân)
    private BigDecimal unitPrice;

    // Mã chứng từ ngoài (nếu có)
    private String referenceCode;

    private String note;
}
