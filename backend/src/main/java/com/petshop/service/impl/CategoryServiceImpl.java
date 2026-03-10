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
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục cha không tồn tại"));
            if (parent.getLevel() >= 2) {
                throw new BadRequestException("Danh mục chỉ hỗ trợ tối đa 3 cấp");
            }
        }
        
        String slug = generateFullSlug(request.getName(), parent);
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
        
        if (parent != null) {
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
        
        // Xác định parent mới
        Category newParent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("Không thể đặt danh mục làm cha của chính nó");
            }
            if (isDescendant(category, request.getParentId())) {
                throw new BadRequestException("Không thể đặt danh mục con làm cha");
            }
            newParent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục cha không tồn tại"));
            int newLevel = newParent.getLevel() + 1;
            int maxChildDepth = getMaxChildDepth(category);
            if (newLevel + maxChildDepth > 2) {
                throw new BadRequestException("Danh mục chỉ hỗ trợ tối đa 3 cấp");
            }
        }
        
        String slug = generateFullSlug(request.getName(), newParent);
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
        
        if (newParent != null) {
            category.setParent(newParent);
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
    public List<CategoryDTO> getAdminCategoryTree() {
        return categoryRepository.findByParentIsNullOrderByDisplayOrderAsc().stream()
            .map(this::mapToDTOWithAllChildren)
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
    
    private String generateFullSlug(String name, Category parent) {
        String baseSlug = generateSlug(name);
        if (parent == null) {
            return baseSlug;
        }
        // Lấy slug gốc (root) của cây cha
        String parentSlug = generateSlug(getRootAncestor(parent).getName());
        if (parent.getParent() != null) {
            // parent ở level 1 → slug = root-parent-name
            parentSlug = parentSlug + "-" + generateSlug(parent.getName());
        }
        return parentSlug + "-" + baseSlug;
    }
    
    private Category getRootAncestor(Category category) {
        Category current = category;
        while (current.getParent() != null) {
            current = current.getParent();
        }
        return current;
    }
    
    private boolean isDescendant(Category category, Long targetId) {
        if (category.getChildren() == null) return false;
        for (Category child : category.getChildren()) {
            if (child.getId().equals(targetId)) return true;
            if (isDescendant(child, targetId)) return true;
        }
        return false;
    }
    
    private int getMaxChildDepth(Category category) {
        if (category.getChildren() == null || category.getChildren().isEmpty()) return 0;
        int max = 0;
        for (Category child : category.getChildren()) {
            max = Math.max(max, 1 + getMaxChildDepth(child));
        }
        return max;
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
            .level(category.getLevel())
            .fullPath(category.getFullPath())
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
    
    private CategoryDTO mapToDTOWithAllChildren(Category category) {
        CategoryDTO dto = mapToDTO(category);
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            dto.setChildren(
                category.getChildren().stream()
                    .sorted((a, b) -> {
                        int orderA = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
                        int orderB = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
                        return Integer.compare(orderA, orderB);
                    })
                    .map(this::mapToDTOWithAllChildren)
                    .collect(Collectors.toList())
            );
        }
        return dto;
    }
}
