package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock_audit_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockAuditItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_audit_id", nullable = false)
    private StockAudit stockAudit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "system_quantity", nullable = false)
    private int systemQuantity;

    @Column(name = "actual_quantity")
    private Integer actualQuantity;

    private int difference;

    @Column(length = 500)
    private String note;
}
