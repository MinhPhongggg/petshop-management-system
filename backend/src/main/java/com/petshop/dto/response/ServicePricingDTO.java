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
public class ServicePricingDTO {
    
    private Long id;
    private String tierName;
    private Double minWeight;
    private Double maxWeight;
    private BigDecimal price;
}
