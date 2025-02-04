package vn.unistock.unistockmanagementsystem.entities;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "wh_name")
    private String whName;

    @Column(name = "wh_location")
    private String whLocation;

    // Nhiều warehouse -> 1 user (manager)
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}
