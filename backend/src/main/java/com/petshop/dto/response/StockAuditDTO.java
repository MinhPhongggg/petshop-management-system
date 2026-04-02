package com.petshop.dto.response;

import com.petshop.entity.StockAudit;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StockAuditDTO {
    private Long id;
    private String code;
    private StockAudit.Status status;
    private String note;
    private String createdByName;
    private String completedByName;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private int totalItems;
    private int diffItems;
    private List<ItemDTO> items;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ItemDTO {
        private Long id;
        private Long variantId;
        private String productName;
        private String variantName;
        private String sku;
        private int systemQuantity;
        private Integer actualQuantity;
        private int difference;
        private String note;
    }
}
