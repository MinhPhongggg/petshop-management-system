package com.petshop.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class StockAuditRequest {
    private String note;
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        private Long variantId;
        private Integer actualQuantity;
        private String note;
    }
}
