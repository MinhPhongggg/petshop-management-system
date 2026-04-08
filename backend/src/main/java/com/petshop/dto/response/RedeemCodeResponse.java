package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedeemCodeResponse {
    private String provider;
    private String destination;
    private Integer expiresInSeconds;
    private String message;
    private String debugCode;
}
