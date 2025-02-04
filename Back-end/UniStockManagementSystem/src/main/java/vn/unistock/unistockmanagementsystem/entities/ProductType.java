package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "product_types")
public class ProductType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Long typeId;

    @Column(name = "type_code")
    private String typeCode;

    @Column(name = "type_name")
    private String typeName;

    // Nhiều ProductType -> 1 ItemGroup
    @ManyToOne
    @JoinColumn(name = "group_id")
    private ItemGroup itemGroup;

    private Boolean status;
    private String description;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}
