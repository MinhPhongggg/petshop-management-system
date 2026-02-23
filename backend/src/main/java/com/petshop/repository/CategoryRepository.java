package com.petshop.repository;

import com.petshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    // Lấy tất cả categories theo thứ tự
    List<Category> findAllByOrderByDisplayOrderAsc();
    
    // Lấy danh mục gốc (không có parent)
    List<Category> findByParentIsNullAndActiveIsTrueOrderByDisplayOrderAsc();
    
    // Lấy danh mục con theo parent
    List<Category> findByParentIdAndActiveIsTrueOrderByDisplayOrderAsc(Long parentId);
    
    // Lấy danh mục theo loại thú cưng
    List<Category> findByPetTypeAndActiveIsTrueOrderByDisplayOrderAsc(Category.PetType petType);
    
    // Lấy tất cả danh mục active có sắp xếp
    @Query("SELECT c FROM Category c WHERE c.active = true ORDER BY c.parent.id NULLS FIRST, c.displayOrder")
    List<Category> findAllActiveOrdered();
    
    // Tìm danh mục theo tên
    Optional<Category> findByNameIgnoreCase(String name);
    
    // Tìm tất cả danh mục theo tên (để xử lý trùng tên)
    List<Category> findAllByNameIgnoreCase(String name);
}
