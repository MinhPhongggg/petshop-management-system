package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingPromotionProgressDTO {

    private Long petId;
    private Long serviceId;
    private long eligibleCompletedCount;
    private int requiredCount;
    private int remainingToReward;
    private boolean canApplyFreeBooking;
}
