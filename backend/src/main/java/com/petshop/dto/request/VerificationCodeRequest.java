package com.petshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationCodeRequest {

    @NotBlank(message = "verificationCode is required")
    private String verificationCode;
}
