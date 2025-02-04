package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "goods_receipt_details")
public class GoodsReceiptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_detail_id")
    private Long receiptDetailId;

    // Nhiều detail -> 1 goodsReceipt
    @ManyToOne
    @JoinColumn(name = "receipt_id")
    private GoodsReceipt goodsReceipt;

    private String itemType;
    private Long itemId;
    private Double receivedQty;

    // Audit
    private LocalDateTime createdAt;
    private Long createdBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}
