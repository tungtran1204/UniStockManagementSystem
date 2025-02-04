package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "production_materials")
public class ProductionMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "production_mat_id")
    private Long productionMatId;

    // Nhiều ProductionMaterial -> 1 ProductionOrder
    @ManyToOne
    @JoinColumn(name = "production_id")
    private ProductionOrder productionOrder;

    // Nhiều ProductionMaterial -> 1 Material
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "required_qty")
    private Double requiredQty;

    // Audit
    private LocalDateTime createdAt;
    private Long createdBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
