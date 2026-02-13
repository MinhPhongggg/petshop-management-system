package com.petshop.service.impl;

import com.petshop.dto.request.CategoryRequest;
import com.petshop.dto.response.CategoryDTO;
import com.petshop.entity.Category;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.CategoryRepository;
import com.petshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryRequest request) {
        String slug = generateSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        Category category = Category.builder()
            .name(request.getName())
            .slug(slug)
            .description(request.getDescription())
            .imageUrl(request.getImageUrl())
            .active(request.getActive() != null ? request.getActive() : true)
            .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
            .build();
        
        // Set petType from String
        if (request.getPetType() != null && !request.getPetType().isEmpty()) {
            category.setPetType(Category.PetType.valueOf(request.getPetType().toUpperCase()));
        }
        
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục cha không tồn tại"));
            category.setParent(parent);
        }
        
        category = categoryRepository.save(category);
        return mapToDTO(category);
    }
    
    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        
        String slug = generateSlug(request.getName());
        if (!category.getSlug().equals(slug) && categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        category.setName(request.getName());
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        
        if (request.getPetType() != null && !request.getPetType().isEmpty()) {
            category.setPetType(Category.PetType.valueOf(request.getPetType().toUpperCase()));
        }
        
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("Không thể đặt danh mục làm cha của chính nó");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục cha không tồn tại"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        
        category = categoryRepository.save(category);
        return mapToDTO(category);
    }
    
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        
        // Soft delete
        category.setActive(false);
        categoryRepository.save(category);
    }
    
    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        return mapToDTO(category);
    }
    
    @Override
    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        return mapToDTO(category);
    }
    
    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryDTO> getRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveIsTrueOrderByDisplayOrderAsc().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryDTO> getChildCategories(Long parentId) {
        return categoryRepository.findByParentIdAndActiveIsTrueOrderByDisplayOrderAsc(parentId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryDTO> getCategoryTree() {
        return categoryRepository.findByParentIsNullAndActiveIsTrueOrderByDisplayOrderAsc().stream()
            .map(this::mapToDTOWithChildren)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryDTO> getCategoriesByPetType(String petType) {
        Category.PetType type = Category.PetType.valueOf(petType.toUpperCase());
        return categoryRepository.findByPetTypeAndActiveIsTrueOrderByDisplayOrderAsc(type).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("đ", "d")
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
    
    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
            .id(category.getId())
            .name(category.getName())
            .slug(category.getSlug())
            .description(category.getDescription())
            .imageUrl(category.getImageUrl())
            .petType(category.getPetType())
            .parentId(category.getParent() != null ? category.getParent().getId() : null)
            .parentName(category.getParent() != null ? category.getParent().getName() : null)
            .active(category.getActive())
            .displayOrder(category.getDisplayOrder())
            .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
            .createdAt(category.getCreatedAt())
            .build();
    }
    
    private CategoryDTO mapToDTOWithChildren(Category category) {
        CategoryDTO dto = mapToDTO(category);
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            dto.setChildren(
                category.getChildren().stream()
                    .filter(Category::getActive)
                    .map(this::mapToDTOWithChildren)
                    .collect(Collectors.toList())
            );
        }
        return dto;
    }
}
