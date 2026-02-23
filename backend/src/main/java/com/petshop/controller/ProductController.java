package com.petshop.controller;

import com.petshop.dto.request.ProductRequest;
import com.petshop.dto.response.ProductDTO;
import com.petshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    // === Public endpoints ===
    
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDTO> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam String keyword,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(productService.searchProducts(keyword, pageable));
    }
    
    @GetMapping("/filter")
    public ResponseEntity<Page<ProductDTO>> filterProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(productService.filterProducts(categoryId, brandId, minPrice, maxPrice, pageable));
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId, pageable));
    }
    
    @GetMapping("/brand/{brandId}")
    public ResponseEntity<Page<ProductDTO>> getProductsByBrand(
            @PathVariable Long brandId,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(productService.getProductsByBrand(brandId, pageable));
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }
    
    @GetMapping("/bestselling")
    public ResponseEntity<List<ProductDTO>> getBestSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getBestSellingProducts(limit));
    }
    
    @GetMapping("/new")
    public ResponseEntity<List<ProductDTO>> getNewProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getNewProducts(limit));
    }
    
    // === Admin endpoints ===
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ProductDTO>> getAllProductsAdmin(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProductsAdmin(pageable));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, 
                                                     @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
