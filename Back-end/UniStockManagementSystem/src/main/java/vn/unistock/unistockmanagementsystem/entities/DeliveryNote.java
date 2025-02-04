package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "delivery_notes")
public class DeliveryNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_id")
    private Long deliveryId;

    private LocalDateTime deliveryDate;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    // Liên kết đơn hàng (nếu có)
    @ManyToOne
    @JoinColumn(name = "sales_order_id")
    private SalesOrder salesOrder;

    @ManyToOne
    @JoinColumn(name = "delivered_by")
    private User deliveredBy;

    private String status;
    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 DeliveryNote -> nhiều DeliveryNoteDetail
    @OneToMany(mappedBy = "deliveryNote", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<DeliveryNoteDetail> details;
}
