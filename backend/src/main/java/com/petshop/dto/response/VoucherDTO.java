package com.petshop.dto.response;

import com.petshop.entity.Voucher;
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
public class VoucherDTO {
    
    private Long id;
    private String code;
    private String description;
    private Voucher.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer usageLimitPerUser;
    private Integer remainingUsage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Voucher.ApplyTo applyTo;
    private Boolean active;
    private Boolean isValid;
    private LocalDateTime createdAt;
}
