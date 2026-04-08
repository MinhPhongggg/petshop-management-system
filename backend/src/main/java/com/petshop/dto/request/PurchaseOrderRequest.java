package com.petshop.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PurchaseOrderRequest {

    @NotNull(message = "Nhà cung cấp là bắt buộc")
    private Long supplierId;

    private String note;

    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        @NotNull
        private Long variantId;
        private int quantity;
        @NotNull
        private BigDecimal unitPrice;
    }
}
