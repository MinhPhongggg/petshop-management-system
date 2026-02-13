package com.petshop.dto.response;

import com.petshop.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Long parentId;
    private String parentName;
    private String fullPath;
    private Integer level;
    private Category.PetType petType;
    private Integer displayOrder;
    private Boolean active;
    private Integer productCount;
    private List<CategoryDTO> children;
    private LocalDateTime createdAt;
}
