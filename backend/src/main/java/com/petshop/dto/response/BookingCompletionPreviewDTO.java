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
public class BookingCompletionPreviewDTO {

    private Long bookingId;
    private Long petId;
    private Long serviceId;
    private BigDecimal originalPrice;
    private BigDecimal finalPrice;
    private BigDecimal discountPercent;
    private long eligibleCompletedCount;
    private int requiredCount;
    private boolean willBeFree;
}
