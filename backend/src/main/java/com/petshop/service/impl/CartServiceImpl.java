package com.petshop.service.impl;

import com.petshop.dto.request.CartItemRequest;
import com.petshop.dto.response.CartDTO;
import com.petshop.dto.response.CartItemDTO;
import com.petshop.entity.CartItem;
import com.petshop.entity.Product;
import com.petshop.entity.ProductVariant;
import com.petshop.entity.User;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.CartItemRepository;
import com.petshop.repository.ProductVariantRepository;
import com.petshop.repository.UserRepository;
import com.petshop.security.UserPrincipal;
import com.petshop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    public CartDTO getCart() {
        User user = getCurrentUser();
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return buildCartDTO(items);
    }

    @Override
    @Transactional
    public CartItemDTO addToCart(CartItemRequest request) {
        User user = getCurrentUser();

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        if (!variant.isActive()) {
            throw new BadRequestException("Sản phẩm không còn hoạt động");
        }

        if (variant.getStock() < request.getQuantity()) {
            throw new BadRequestException("Không đủ hàng trong kho");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndVariantId(
            user.getId(), variant.getId());

        CartItem savedItem;
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (variant.getStock() < newQuantity) {
                throw new BadRequestException("Không đủ hàng trong kho");
            }
            item.setQuantity(newQuantity);
            savedItem = cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                .user(user)
                .variant(variant)
                .quantity(request.getQuantity())
                .build();
            savedItem = cartItemRepository.save(newItem);
        }

        return mapToItemDTO(savedItem);
    }

    @Override
    @Transactional
    public CartItemDTO updateCartItem(Long itemId, Integer quantity) {
        User user = getCurrentUser();

        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Không có quyền truy cập");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        } else {
            if (item.getVariant().getStock() < quantity) {
                throw new BadRequestException("Không đủ hàng trong kho");
            }
            item.setQuantity(quantity);
            CartItem savedItem = cartItemRepository.save(item);
            return mapToItemDTO(savedItem);
        }
    }

    @Override
    @Transactional
    public void removeFromCart(Long itemId) {
        User user = getCurrentUser();

        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Không có quyền truy cập");
        }

        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        cartItemRepository.deleteByUserId(user.getId());
    }

    @Override
    public Long countCartItems() {
        User user = getCurrentUser();
        return cartItemRepository.countByUserId(user.getId());
    }

    private CartDTO buildCartDTO(List<CartItem> items) {
        List<CartItemDTO> itemDTOs = items.stream()
            .map(this::mapToItemDTO)
            .collect(Collectors.toList());

        BigDecimal subtotal = itemDTOs.stream()
            .map(CartItemDTO::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemDTOs.stream()
            .mapToInt(CartItemDTO::getQuantity)
            .sum();

        return CartDTO.builder()
            .items(itemDTOs)
            .subtotal(subtotal)
            .totalItems(totalItems)
            .build();
    }

    private CartItemDTO mapToItemDTO(CartItem item) {
        ProductVariant variant = item.getVariant();
        Product product = variant.getProduct();
        
        BigDecimal price = variant.getPrice();
        BigDecimal salePrice = product.getSalePrice();
        BigDecimal currentPrice = (salePrice != null && salePrice.compareTo(price) < 0) ? salePrice : price;
        BigDecimal subtotal = currentPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        String productImage = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            productImage = product.getImages().stream()
                .filter(img -> img.isPrimary())
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(product.getImages().get(0).getImageUrl());
        }

        return CartItemDTO.builder()
            .id(item.getId())
            .productId(product.getId())
            .productName(product.getName())
            .productSlug(product.getSlug())
            .productImage(productImage)
            .variantId(variant.getId())
            .variantName(variant.getName())
            .price(price)
            .salePrice(salePrice)
            .currentPrice(currentPrice)
            .stockQuantity(variant.getStock())
            .inStock(variant.getStock() > 0)
            .quantity(item.getQuantity())
            .subtotal(subtotal)
            .createdAt(item.getCreatedAt())
            .build();
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
}
