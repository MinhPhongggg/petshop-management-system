package com.petshop.service.impl;

import com.petshop.dto.request.StockMovementRequest;
import com.petshop.dto.response.ProductVariantDTO;
import com.petshop.dto.response.StockMovementDTO;
import com.petshop.entity.ProductVariant;
import com.petshop.entity.StockMovement;
import com.petshop.entity.User;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.ProductVariantRepository;
import com.petshop.repository.StockMovementRepository;
import com.petshop.repository.UserRepository;
import com.petshop.security.UserPrincipal;
import com.petshop.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    
    private final StockMovementRepository stockMovementRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public StockMovementDTO importStock(StockMovementRequest request) {
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
            .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại"));
        
        User user = getCurrentUser();
        
        int previousStock = variant.getStock();
        int newStock = previousStock + request.getQuantity();
        
        variant.setStock(newStock);
        productVariantRepository.save(variant);
        
        StockMovement movement = StockMovement.builder()
            .variant(variant)
            .movementType(StockMovement.MovementType.IMPORT)
            .quantity(request.getQuantity())
            .quantityBefore(previousStock)
            .quantityAfter(newStock)
            .note(request.getNote())
            .createdBy(user)
            .build();
        
        movement = stockMovementRepository.save(movement);
        return mapToDTO(movement);
    }
    
    @Override
    @Transactional
    public StockMovementDTO adjustStock(StockMovementRequest request) {
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
            .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại"));
        
        User user = getCurrentUser();
        
        int previousStock = variant.getStock();
        int newStock = previousStock + request.getQuantity(); // Can be negative for reduction
        
        if (newStock < 0) {
            throw new BadRequestException("Số lượng tồn kho không thể âm");
        }
        
        variant.setStock(newStock);
        productVariantRepository.save(variant);
        
        StockMovement movement = StockMovement.builder()
            .variant(variant)
            .movementType(StockMovement.MovementType.ADJUSTMENT)
            .quantity(Math.abs(request.getQuantity()))
            .quantityBefore(previousStock)
            .quantityAfter(newStock)
            .note(request.getNote())
            .createdBy(user)
            .build();
        
        movement = stockMovementRepository.save(movement);
        return mapToDTO(movement);
    }
    
    @Override
    public Page<StockMovementDTO> getStockMovements(Long variantId, Pageable pageable) {
        return stockMovementRepository.findByVariantIdOrderByCreatedAtDesc(variantId, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public List<ProductVariantDTO> getLowStockProducts() {
        int threshold = 10; // Default threshold
        return productVariantRepository.findLowStock(threshold).stream()
            .map(this::mapToVariantDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductVariantDTO> getOutOfStockProducts() {
        return productVariantRepository.findOutOfStock().stream()
            .map(this::mapToVariantDTO)
            .collect(Collectors.toList());
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Chưa đăng nhập");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private StockMovementDTO mapToDTO(StockMovement movement) {
        return StockMovementDTO.builder()
            .id(movement.getId())
            .variantId(movement.getVariant().getId())
            .productName(movement.getVariant().getProduct().getName())
            .variantName(movement.getVariant().getName())
            .movementType(movement.getMovementType())
            .quantity(movement.getQuantity())
            .quantityBefore(movement.getQuantityBefore())
            .quantityAfter(movement.getQuantityAfter())
            .note(movement.getNote())
            .createdByName(movement.getCreatedBy().getFullName())
            .createdAt(movement.getCreatedAt())
            .build();
    }
    
    private ProductVariantDTO mapToVariantDTO(ProductVariant variant) {
        return ProductVariantDTO.builder()
            .id(variant.getId())
            .productId(variant.getProduct().getId())
            .productName(variant.getProduct().getName())
            .name(variant.getName())
            .sku(variant.getSku())
            .price(variant.getPrice())
            .stock(variant.getStock())
            .active(variant.isActive())
            .build();
    }
}
