package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandDTO {
    
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private String country;
    private Boolean active;
    private Integer productCount;
}
