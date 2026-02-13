package com.petshop.dto.request;

import com.petshop.entity.Voucher;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherRequest {
    
    @NotBlank(message = "Voucher code is required")
    private String code;
    
    private String description;
    
    @NotNull(message = "Discount type is required")
    private Voucher.DiscountType discountType;
    
    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;
    
    private BigDecimal maxDiscount;
    
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    
    private Integer usageLimit;
    
    private Integer usageLimitPerUser = 1;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endDate;
    
    private Voucher.ApplyTo applyTo = Voucher.ApplyTo.ALL;
    
    private Boolean active = true;
}
