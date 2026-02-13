package com.petshop.controller;

import com.petshop.dto.request.StockMovementRequest;
import com.petshop.dto.response.ProductVariantDTO;
import com.petshop.dto.response.StockMovementDTO;
import com.petshop.service.InventoryService;
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

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    @PostMapping("/import")
    public ResponseEntity<StockMovementDTO> importStock(@Valid @RequestBody StockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.importStock(request));
    }
    
    @PostMapping("/adjust")
    public ResponseEntity<StockMovementDTO> adjustStock(@Valid @RequestBody StockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.adjustStock(request));
    }
    
    @GetMapping("/movements/{variantId}")
    public ResponseEntity<Page<StockMovementDTO>> getStockMovements(
            @PathVariable Long variantId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getStockMovements(variantId, pageable));
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductVariantDTO>> getLowStockProducts() {
        return ResponseEntity.ok(inventoryService.getLowStockProducts());
    }
    
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<ProductVariantDTO>> getOutOfStockProducts() {
        return ResponseEntity.ok(inventoryService.getOutOfStockProducts());
    }
}
