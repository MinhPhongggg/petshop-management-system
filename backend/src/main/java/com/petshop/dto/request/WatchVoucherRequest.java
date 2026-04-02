package com.petshop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WatchVoucherRequest {

    @NotNull(message = "productId is required")
    private Long productId;

    @NotNull(message = "watchedSeconds is required")
    @Min(value = 1, message = "watchedSeconds must be greater than 0")
    private Integer watchedSeconds;
}
