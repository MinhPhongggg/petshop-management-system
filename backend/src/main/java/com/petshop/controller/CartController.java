package com.petshop.controller;

import com.petshop.dto.request.CartItemRequest;
import com.petshop.dto.response.CartDTO;
import com.petshop.dto.response.CartItemDTO;
import com.petshop.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping
    public ResponseEntity<CartDTO> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }
    
    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }
    
    @PutMapping("/{itemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(@PathVariable Long itemId, 
                                                   @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(itemId, quantity));
    }
    
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long itemId) {
        cartService.removeFromCart(itemId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
