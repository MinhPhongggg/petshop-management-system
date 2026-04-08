package com.petshop.dto.response;

import com.petshop.entity.PurchaseOrder;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PurchaseOrderDTO {
    private Long id;
    private String code;
    private Long supplierId;
    private String supplierName;
    private PurchaseOrder.Status status;
    private List<ItemDTO> items;
    private BigDecimal totalAmount;
    private String note;
    private String createdByName;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String receivedByName;
    private LocalDateTime receivedAt;
    private LocalDateTime createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ItemDTO {
        private Long id;
        private Long variantId;
        private String productName;
        private String variantName;
        private String sku;
        private int quantity;
        private BigDecimal unitPrice;
        private int receivedQuantity;
        private BigDecimal subtotal;
    }
}
