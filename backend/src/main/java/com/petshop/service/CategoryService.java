package com.petshop.service;

import com.petshop.dto.request.CategoryRequest;
import com.petshop.dto.response.CategoryDTO;

import java.util.List;

public interface CategoryService {
    
    // CRUD
    CategoryDTO createCategory(CategoryRequest request);
    CategoryDTO updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    CategoryDTO getCategoryById(Long id);
    CategoryDTO getCategoryBySlug(String slug);
    
    // Lấy danh sách
    List<CategoryDTO> getAllCategories();
    List<CategoryDTO> getRootCategories();
    List<CategoryDTO> getChildCategories(Long parentId);
    List<CategoryDTO> getCategoryTree();
    List<CategoryDTO> getCategoriesByPetType(String petType);
}
