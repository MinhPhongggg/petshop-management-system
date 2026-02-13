package com.petshop.repository;

import com.petshop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<CartItem> findByUserIdAndVariantId(Long userId, Long variantId);
    
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.user.id = :userId")
    void deleteByUserId(Long userId);
    
    Long countByUserId(Long userId);
}
