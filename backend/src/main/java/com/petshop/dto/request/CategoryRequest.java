package com.petshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CategoryRequest {
    
    @NotBlank(message = "Category name is required")
    private String name;
    
    private String description;
    
    private String imageUrl;
    
    private Long parentId;
    
    private String petType;
    
    private Integer displayOrder = 0;
    
    private Boolean active = true;
}
