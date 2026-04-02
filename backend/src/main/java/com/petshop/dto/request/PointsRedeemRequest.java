package com.petshop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PointsRedeemRequest {

    @NotNull(message = "pointsToRedeem is required")
    @Min(value = 1, message = "pointsToRedeem must be greater than 0")
    private Long pointsToRedeem;
}
