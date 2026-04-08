package com.petshop.service.impl;

import com.petshop.dto.request.StockMovementRequest;
import com.petshop.dto.response.StockMovementDTO;
import com.petshop.entity.Product;
import com.petshop.entity.ProductVariant;
import com.petshop.entity.StockMovement;
import com.petshop.entity.User;
import com.petshop.repository.ProductVariantRepository;
import com.petshop.repository.StockMovementRepository;
import com.petshop.repository.UserRepository;
import com.petshop.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void importStockShouldUpdateWeightedAverageCost() {
        User user = User.builder().id(1L).fullName("Tester").email("t@x.com").role(User.Role.ADMIN).active(true).build();
        UserPrincipal principal = UserPrincipal.builder()
                .id(1L).email("t@x.com").password("x").role(User.Role.ADMIN).active(true)
                .authorities(Collections.emptyList())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Product product = Product.builder().id(99L).name("Dog Food").build();
        ProductVariant variant = ProductVariant.builder()
                .id(10L)
                .product(product)
                .name("500g")
                .sku("SKU-1")
                .price(BigDecimal.valueOf(120_000))
                .stock(20)
                .averageCost(BigDecimal.valueOf(50))
                .build();

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(variant));
        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        StockMovementRequest req = new StockMovementRequest();
        req.setVariantId(10L);
        req.setMovementType(StockMovement.MovementType.IMPORT);
        req.setQuantity(10);
        req.setUnitPrice(BigDecimal.valueOf(100));
        req.setNote("import test");

        StockMovementDTO dto = inventoryService.importStock(req);

        assertEquals(30, variant.getStock());
        assertEquals(new BigDecimal("66.67"), variant.getAverageCost());
        assertEquals(StockMovement.MovementType.IMPORT, dto.getMovementType());
        assertEquals(10, dto.getQuantity());
        assertEquals("MANUAL_IMPORT", dto.getReferenceType());
    }
}
