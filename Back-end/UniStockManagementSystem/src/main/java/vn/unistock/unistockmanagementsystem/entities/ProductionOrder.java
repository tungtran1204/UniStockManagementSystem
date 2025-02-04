package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "production_orders")
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "production_id")
    private Long productionId;

    // Nhiều ProductionOrder -> 1 Product
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Double plannedQty;
    private LocalDateTime orderDate;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String status;

    // Ai tạo
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdByUser;

    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 ProductionOrder -> nhiều ProductionMaterial
    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<ProductionMaterial> productionMaterials;
}

