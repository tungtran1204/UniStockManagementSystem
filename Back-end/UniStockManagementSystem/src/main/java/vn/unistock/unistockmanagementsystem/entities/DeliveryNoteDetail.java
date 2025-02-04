package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "delivery_note_details")
public class DeliveryNoteDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_detail_id")
    private Long deliveryDetailId;

    @ManyToOne
    @JoinColumn(name = "delivery_id")
    private DeliveryNote deliveryNote;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Double deliveredQty;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}
