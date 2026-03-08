package com.petshop.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDTO {
    
    private Long id;
    private String imageUrl;
    
    @JsonProperty("isPrimary")
    private boolean primary;
    
    private int sortOrder;
    
    // For compatibility with existing code
    public boolean isPrimary() {
        return primary;
    }
}
