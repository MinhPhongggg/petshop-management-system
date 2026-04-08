package com.petshop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PointsRedeemConfirmRequest {

    @NotNull(message = "pointsToRedeem is required")
    @Min(value = 1, message = "pointsToRedeem must be greater than 0")
    private Long pointsToRedeem;

    @NotBlank(message = "verificationCode is required")
    private String verificationCode;
}
