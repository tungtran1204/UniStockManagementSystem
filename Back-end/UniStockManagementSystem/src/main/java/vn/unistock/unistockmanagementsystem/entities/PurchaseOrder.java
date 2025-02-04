package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_id")
    private Long poId;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    private LocalDateTime orderDate;

    // Ai tạo
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdByUser;

    private String status;
    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 PurchaseOrder -> nhiều PurchaseOrderDetail
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<PurchaseOrderDetail> details;
}

