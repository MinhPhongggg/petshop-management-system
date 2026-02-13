package com.petshop.service;

import com.petshop.dto.request.ProductRequest;
import com.petshop.dto.response.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    
    // CRUD
    ProductDTO createProduct(ProductRequest request);
    ProductDTO updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    ProductDTO getProductById(Long id);
    ProductDTO getProductBySlug(String slug);
    
    // Danh sách sản phẩm
    Page<ProductDTO> getAllProducts(Pageable pageable);
    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);
    Page<ProductDTO> getProductsByBrand(Long brandId, Pageable pageable);
    
    // Tìm kiếm & Lọc
    Page<ProductDTO> searchProducts(String keyword, Pageable pageable);
    Page<ProductDTO> filterProducts(Long categoryId, Long brandId, 
                                    BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    // Sản phẩm nổi bật
    List<ProductDTO> getFeaturedProducts();
    List<ProductDTO> getBestSellingProducts(int limit);
    List<ProductDTO> getNewProducts(int limit);
}
