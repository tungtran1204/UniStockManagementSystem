package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchase_order_details")
public class PurchaseOrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pod_id")
    private Long podId;

    @ManyToOne
    @JoinColumn(name = "po_id")
    private PurchaseOrder purchaseOrder;

    private String itemType;  // 'MATERIAL' / 'PRODUCT'
    private Long itemId;
    private Double orderQty;
    private Double unitPrice;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}
