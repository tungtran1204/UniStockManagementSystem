package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "materials")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "material_id")
    private Long materialId;

    @Column(name = "material_name")
    private String materialName;

    private String unit;
    private String description;

    // Nhiều material -> 1 group (VD: NVL, CCDC)
    @ManyToOne
    @JoinColumn(name = "group_id")
    private ItemGroup itemGroup;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}
