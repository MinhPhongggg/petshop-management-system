package com.petshop.service;

import com.petshop.dto.request.StockMovementRequest;
import com.petshop.dto.response.ProductVariantDTO;
import com.petshop.dto.response.StockMovementDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InventoryService {
    
    // Nhập hàng
    StockMovementDTO importStock(StockMovementRequest request);
    
    // Điều chỉnh số lượng
    StockMovementDTO adjustStock(StockMovementRequest request);
    
    // Lịch sử nhập/xuất kho
    Page<StockMovementDTO> getStockMovements(Long variantId, Pageable pageable);
    
    // Sản phẩm sắp hết hàng
    List<ProductVariantDTO> getLowStockProducts();
    
    // Sản phẩm hết hàng
    List<ProductVariantDTO> getOutOfStockProducts();
}
