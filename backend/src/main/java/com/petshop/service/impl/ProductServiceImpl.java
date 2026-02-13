package com.petshop.service.impl;

import com.petshop.dto.request.ProductRequest;
import com.petshop.dto.response.ProductDTO;
import com.petshop.dto.response.ProductImageDTO;
import com.petshop.dto.response.ProductVariantDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    
    @Override
    @Transactional
    public ProductDTO createProduct(ProductRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        
        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại"));
        }
        
        Product product = Product.builder()
            .name(request.getName())
            .slug(request.getSlug())
            .description(request.getDescription())
            .shortDescription(request.getShortDescription())
            .category(category)
            .brand(brand)
            .basePrice(request.getBasePrice())
            .salePrice(request.getSalePrice())
            .featured(request.isFeatured())
            .active(true)
            .images(new ArrayList<>())
            .variants(new ArrayList<>())
            .build();
        
        product = productRepository.save(product);
        
        // Add images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            Product finalProduct = product;
            List<ProductImage> images = request.getImages().stream()
                .map(imgReq -> ProductImage.builder()
                    .product(finalProduct)
                    .imageUrl(imgReq.getImageUrl())
                    .isPrimary(imgReq.isPrimary())
                    .sortOrder(imgReq.getSortOrder())
                    .build())
                .collect(Collectors.toList());
            productImageRepository.saveAll(images);
            product.setImages(images);
        }
        
        // Add variants
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            Product finalProduct2 = product;
            List<ProductVariant> variants = request.getVariants().stream()
                .map(varReq -> ProductVariant.builder()
                    .product(finalProduct2)
                    .name(varReq.getName())
                    .sku(varReq.getSku())
                    .price(varReq.getPrice())
                    .stock(varReq.getStock())
                    .active(true)
                    .build())
                .collect(Collectors.toList());
            productVariantRepository.saveAll(variants);
            product.setVariants(variants);
        }
        
        return mapToDTO(product);
    }
    
    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        if (!product.getSlug().equals(request.getSlug()) && 
            productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        
        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại"));
        }
        
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());
        product.setFeatured(request.isFeatured());
        
        product = productRepository.save(product);
        return mapToDTO(product);
    }
    
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        // Soft delete
        product.setActive(false);
        productRepository.save(product);
    }
    
    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        return mapToDTO(product);
    }
    
    @Override
    public ProductDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        return mapToDTO(product);
    }
    
    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveIsTrue(pageable).map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable).map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> filterProducts(Long categoryId, Long brandId, 
                                           BigDecimal minPrice, BigDecimal maxPrice, 
                                           Pageable pageable) {
        return productRepository.filterProducts(categoryId, brandId, minPrice, maxPrice, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveIsTrue(categoryId, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> getProductsByBrand(Long brandId, Pageable pageable) {
        return productRepository.findByBrandIdAndActiveIsTrue(brandId, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByFeaturedIsTrueAndActiveIsTrue().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductDTO> getBestSellingProducts(int limit) {
        return productRepository.findBestSelling(Pageable.ofSize(limit)).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductDTO> getNewProducts(int limit) {
        return productRepository.findNewProducts(Pageable.ofSize(limit)).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private ProductDTO mapToDTO(Product product) {
        List<ProductImageDTO> imageDTOs = new ArrayList<>();
        String primaryImage = null;
        if (product.getImages() != null) {
            imageDTOs = product.getImages().stream()
                .map(img -> ProductImageDTO.builder()
                    .id(img.getId())
                    .imageUrl(img.getImageUrl())
                    .isPrimary(img.isPrimary())
                    .sortOrder(img.getSortOrder())
                    .build())
                .collect(Collectors.toList());
            
            // Get primary image
            primaryImage = product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());
        }

        List<ProductVariantDTO> variantDTOs = new ArrayList<>();
        BigDecimal minPrice = product.getBasePrice();
        BigDecimal maxPrice = product.getBasePrice();
        int totalStock = 0;
        
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            variantDTOs = product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .map(v -> ProductVariantDTO.builder()
                    .id(v.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .name(v.getName())
                    .sku(v.getSku())
                    .price(v.getPrice())
                    .stock(v.getStock())
                    .active(v.isActive())
                    .build())
                .collect(Collectors.toList());
            
            // Calculate min/max prices and total stock
            for (ProductVariant v : product.getVariants()) {
                if (v.isActive()) {
                    if (v.getPrice().compareTo(minPrice) < 0) minPrice = v.getPrice();
                    if (v.getPrice().compareTo(maxPrice) > 0) maxPrice = v.getPrice();
                    totalStock += v.getStock();
                }
            }
        }
        
        boolean hasDiscount = product.getSalePrice() != null && 
            product.getSalePrice().compareTo(product.getBasePrice()) < 0;

        return ProductDTO.builder()
            .id(product.getId())
            .name(product.getName())
            .slug(product.getSlug())
            .description(product.getDescription())
            .shortDescription(product.getShortDescription())
            .categoryId(product.getCategory().getId())
            .categoryName(product.getCategory().getName())
            .petType(product.getCategory().getPetType())
            .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
            .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
            .primaryImage(primaryImage)
            .images(imageDTOs)
            .variants(variantDTOs)
            .basePrice(product.getBasePrice())
            .minPrice(minPrice)
            .maxPrice(maxPrice)
            .hasDiscount(hasDiscount)
            .averageRating(product.getAverageRating())
            .reviewCount(product.getReviewCount())
            .soldCount(product.getSoldCount())
            .totalStock(totalStock)
            .featured(product.isFeatured())
            .active(product.isActive())
            .inStock(totalStock > 0)
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }
}
