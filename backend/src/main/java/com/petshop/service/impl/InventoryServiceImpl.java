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

import java.time.LocalDate;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng nhập phải lớn hơn 0");
        }
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
            .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại"));
        
        User user = getCurrentUser();
        
        int previousStock = variant.getStock();
        int importQty = request.getQuantity();
        int newStock = previousStock + importQty;
        
        if (request.getUnitPrice() != null && request.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
            applyWeightedAverageCost(variant, importQty, request.getUnitPrice());
        }
        variant.setStock(newStock);
        productVariantRepository.save(variant);
        
        StockMovement movement = StockMovement.builder()
            .variant(variant)
            .movementType(StockMovement.MovementType.IMPORT)
            .quantity(importQty)
            .quantityBefore(previousStock)
            .quantityAfter(newStock)
            .note(request.getNote())
            .unitCost(variant.getAverageCost())
            .referenceType("MANUAL_IMPORT")
            .referenceCode(request.getReferenceCode())
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
        if (request.getQuantity() == null || request.getQuantity() == 0) {
            throw new BadRequestException("Số lượng điều chỉnh không hợp lệ");
        }
        int deltaQty = request.getQuantity(); // positive -> ADJUST_IN, negative -> ADJUST_OUT
        int newStock = previousStock + deltaQty;
        
        if (newStock < 0) {
            throw new BadRequestException("Số lượng tồn kho không thể âm");
        }
        
        variant.setStock(newStock);
        productVariantRepository.save(variant);
        
        StockMovement movement = StockMovement.builder()
            .variant(variant)
            .movementType(deltaQty > 0 ? StockMovement.MovementType.ADJUST_IN : StockMovement.MovementType.ADJUST_OUT)
            .quantity(deltaQty)
            .quantityBefore(previousStock)
            .quantityAfter(newStock)
            .note(request.getNote())
            .unitCost(variant.getAverageCost())
            .referenceType("STOCK_AUDIT_ADJUST")
            .referenceCode(request.getReferenceCode())
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
        return productVariantRepository.findLowStockDynamic().stream()
            .map(this::mapToVariantDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductVariantDTO> getOutOfStockProducts() {
        return productVariantRepository.findOutOfStock().stream()
            .map(this::mapToVariantDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductVariantDTO> getExpiringProducts() {
        LocalDate threshold = LocalDate.now().plusDays(30);
        return productVariantRepository.findExpiringBefore(threshold).stream()
            .map(this::mapToVariantDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockMovementDTO exportStock(StockMovementRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng xuất phải lớn hơn 0");
        }
        if (request.getMovementType() != StockMovement.MovementType.EXPORT_DAMAGE &&
                request.getMovementType() != StockMovement.MovementType.EXPORT_RETURN_SUPPLIER &&
                request.getMovementType() != StockMovement.MovementType.EXPORT_SALE) {
            throw new BadRequestException("Loại xuất kho không hợp lệ");
        }

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại"));
        User user = getCurrentUser();

        int previousStock = variant.getStock();
        int deltaQty = -request.getQuantity();
        int newStock = previousStock + deltaQty;
        if (newStock < 0) {
            throw new BadRequestException("Số lượng tồn kho không thể âm");
        }

        variant.setStock(newStock);
        productVariantRepository.save(variant);

        StockMovement movement = StockMovement.builder()
                .variant(variant)
                .movementType(request.getMovementType())
                .quantity(deltaQty)
                .quantityBefore(previousStock)
                .quantityAfter(newStock)
                .note(request.getNote())
                .unitCost(variant.getAverageCost())
                .referenceType("MANUAL_EXPORT")
                .referenceCode(request.getReferenceCode())
                .createdBy(user)
                .build();
        movement = stockMovementRepository.save(movement);
        return mapToDTO(movement);
    }

    @Override
    public List<ProductVariantDTO> getOverStockProducts() {
        return productVariantRepository.findOverStock().stream()
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
            .unitCost(movement.getUnitCost())
            .referenceType(movement.getReferenceType())
            .referenceCode(movement.getReferenceCode())
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
            .barcode(variant.getBarcode())
            .unit(variant.getUnit())
            .price(variant.getPrice())
            .lastImportPrice(variant.getLastImportPrice())
            .averageCost(variant.getAverageCost())
            .stock(variant.getStock())
            .minStock(variant.getMinStock())
            .maxStock(variant.getMaxStock())
            .expiryDate(variant.getExpiryDate())
            .active(variant.isActive())
            .build();
    }

    private void applyWeightedAverageCost(ProductVariant variant, int importQty, BigDecimal importUnitPrice) {
        int oldStock = Math.max(variant.getStock(), 0);
        BigDecimal oldCost = variant.getAverageCost() != null ? variant.getAverageCost() : BigDecimal.ZERO;

        BigDecimal oldTotal = oldCost.multiply(BigDecimal.valueOf(oldStock));
        BigDecimal inTotal = importUnitPrice.multiply(BigDecimal.valueOf(importQty));
        int newTotalQty = oldStock + importQty;

        BigDecimal newAverage = BigDecimal.ZERO;
        if (newTotalQty > 0) {
            newAverage = oldTotal.add(inTotal)
                    .divide(BigDecimal.valueOf(newTotalQty), 2, RoundingMode.HALF_UP);
        }
        variant.setLastImportPrice(importUnitPrice);
        variant.setAverageCost(newAverage);
    }
}
