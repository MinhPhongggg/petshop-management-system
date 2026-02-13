package com.petshop.service;

import com.petshop.dto.request.CartItemRequest;
import com.petshop.dto.response.CartDTO;
import com.petshop.dto.response.CartItemDTO;

public interface CartService {
    
    // Lấy giỏ hàng
    CartDTO getCart();
    
    // Thêm vào giỏ
    CartItemDTO addToCart(CartItemRequest request);
    
    // Cập nhật số lượng
    CartItemDTO updateCartItem(Long itemId, Integer quantity);
    
    // Xóa khỏi giỏ
    void removeFromCart(Long itemId);
    
    // Xóa toàn bộ giỏ
    void clearCart();
    
    // Đếm số lượng
    Long countCartItems();
}
