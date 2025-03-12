package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "good_receipt_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoodReceiptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long grnDetailsId;

    @ManyToOne
    @JoinColumn(name = "grn_id", nullable = false)
    private GoodReceiptNote goodReceiptNote;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "material_id", nullable = true)
    private Material material;

    @ManyToOne
    @JoinColumn(name = "product)_id", nullable = true)
    private Product product;

    @Column(nullable = false)
    private Double quantity;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    private Long referenceId;

    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;

    public enum ReferenceType {
        PURCHASE_ORDER_DETAIL, SALE_ORDER_DETAIL
    }


}
