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
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final StockMovementRepository stockMovementRepository;
    
    @Override
    @Transactional
    public ProductDTO createProduct(ProductRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        
        // Validate: chỉ cho phép gán sản phẩm vào danh mục lá (không có danh mục con)
        if (categoryRepository.existsByParentId(category.getId())) {
            throw new BadRequestException("Sản phẩm chỉ có thể gán vào danh mục lá (không có danh mục con)");
        }
        
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
                    .minStock(varReq.getMinStock())
                    .expiryDate(varReq.getExpiryDate())
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
        
        // Validate: chỉ kiểm tra danh mục lá khi thay đổi danh mục
        boolean categoryChanged = !product.getCategory().getId().equals(request.getCategoryId());
        if (categoryChanged && categoryRepository.existsByParentId(category.getId())) {
            throw new BadRequestException("Sản phẩm chỉ có thể gán vào danh mục lá (không có danh mục con)");
        }
        
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
        
        // Cập nhật images - clear và add vào collection gốc (orphanRemoval sẽ tự xóa)
        if (request.getImages() != null) {
            product.getImages().clear();
        }
        
        // Cập nhật variants - clear và add vào collection gốc (orphanRemoval sẽ tự xóa)
        if (request.getVariants() != null) {
            product.getVariants().clear();
        }
        
        // Flush để đảm bảo xóa variants/images cũ trước khi thêm mới (tránh lỗi duplicate SKU)
        productRepository.saveAndFlush(product);
        
        // Thêm images mới
        if (request.getImages() != null) {
            for (var imgReq : request.getImages()) {
                product.getImages().add(ProductImage.builder()
                    .product(product)
                    .imageUrl(imgReq.getImageUrl())
                    .isPrimary(imgReq.isPrimary())
                    .sortOrder(imgReq.getSortOrder())
                    .build());
            }
        }
        
        // Thêm variants mới
        if (request.getVariants() != null) {
            for (var varReq : request.getVariants()) {
                product.getVariants().add(ProductVariant.builder()
                    .product(product)
                    .name(varReq.getName())
                    .sku(varReq.getSku())
                    .price(varReq.getPrice())
                    .stock(varReq.getStock())
                    .minStock(varReq.getMinStock())
                    .expiryDate(varReq.getExpiryDate())
                    .active(true)
                    .build());
            }
        }
        
        product = productRepository.save(product);
        return mapToDTO(product);
    }
    
    @Override
    @Transactional
    public String deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        List<Long> variantIds = product.getVariants().stream()
            .map(ProductVariant::getId)
            .collect(Collectors.toList());
        
        // Luôn xóa cart items có liên quan
        if (!variantIds.isEmpty()) {
            cartItemRepository.deleteByVariantIdIn(variantIds);
        }
        
        // Kiểm tra sản phẩm có trong đơn hàng không
        boolean hasOrders = !variantIds.isEmpty() && orderItemRepository.existsByVariantIdIn(variantIds);
        
        if (hasOrders) {
            // Soft delete - ẩn sản phẩm thay vì xóa (giữ lịch sử đơn hàng)
            product.setActive(false);
            product.getVariants().forEach(v -> v.setActive(false));
            productRepository.save(product);
            return "Sản phẩm đã được ẩn do có đơn hàng liên quan";
        } else {
            // Hard delete - không có đơn hàng liên quan, xóa thực sự
            if (!variantIds.isEmpty()) {
                stockMovementRepository.deleteByVariantIdIn(variantIds);
            }
            productRepository.delete(product);
            return "Đã xóa sản phẩm";
        }
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
    @Transactional
    public ProductDTO toggleActive(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("S\u1ea3n ph\u1ea9m kh\u00f4ng t\u1ed3n t\u1ea1i"));
        product.setActive(!product.isActive());
        return mapToDTO(productRepository.save(product));
    }    
    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveIsTrue(pageable).map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> getAllProductsAdmin(Long categoryId, Pageable pageable) {
        if (categoryId != null) {
            List<Long> categoryIds = getAllDescendantCategoryIds(categoryId);
            return productRepository.findByCategoryIdIn(categoryIds, pageable).map(this::mapToDTO);
        }
        return productRepository.findAll(pageable).map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> searchProducts(String keyword, Long categoryId, Long brandId,
                                           BigDecimal minPrice, BigDecimal maxPrice,
                                           Pageable pageable) {
        List<Long> categoryIds = categoryId != null ? getAllDescendantCategoryIds(categoryId) : null;
        return productRepository.searchProducts(keyword, categoryIds, brandId, minPrice, maxPrice, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> filterProducts(Long categoryId, Long brandId, 
                                           BigDecimal minPrice, BigDecimal maxPrice, 
                                           Pageable pageable) {
        List<Long> categoryIds = categoryId != null ? getAllDescendantCategoryIds(categoryId) : null;
        return productRepository.filterProducts(categoryIds, brandId, minPrice, maxPrice, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        List<Long> categoryIds = getAllDescendantCategoryIds(categoryId);
        return productRepository.findByCategoryIdInAndActiveIsTrue(categoryIds, pageable)
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
    
    private Category getRootCategory(Category category) {
        Category current = category;
        while (current.getParent() != null) {
            current = current.getParent();
        }
        return current;
    }
    
    /**
     * Lấy tất cả ID danh mục con (bao gồm cả chính nó)
     * VD: Chọn "Chó" → trả về [Chó, Thức ăn cho chó, Thức ăn hạt, Thức ăn ướt, ...]
     */
    private List<Long> getAllDescendantCategoryIds(Long categoryId) {
        List<Long> ids = new ArrayList<>();
        ids.add(categoryId);
        collectChildCategoryIds(categoryId, ids);
        return ids;
    }
    
    private void collectChildCategoryIds(Long parentId, List<Long> ids) {
        List<Category> children = categoryRepository.findAllByParentId(parentId);
        for (Category child : children) {
            ids.add(child.getId());
            collectChildCategoryIds(child.getId(), ids);
        }
    }
    
    private ProductDTO mapToDTO(Product product) {
        List<ProductImageDTO> imageDTOs = new ArrayList<>();
        String primaryImage = null;
        if (product.getImages() != null) {
            imageDTOs = product.getImages().stream()
                .map(img -> ProductImageDTO.builder()
                    .id(img.getId())
                    .imageUrl(img.getImageUrl())
                    .primary(img.isPrimary())
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
                    .minStock(v.getMinStock())
                    .expiryDate(v.getExpiryDate())
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
            .categoryPath(product.getCategory().getFullPath())
            .petType(getRootCategory(product.getCategory()).getPetType())
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
