package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "goods_receipts")
public class GoodsReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    private LocalDateTime receiptDate;

    // Nhiều GoodsReceipt -> 1 warehouse
    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    private Long sourceRef; // tuỳ logic
    // Ai nhận
    @ManyToOne
    @JoinColumn(name = "received_by")
    private User receivedBy;

    private String status;
    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 GoodsReceipt -> nhiều GoodsReceiptDetail
    @OneToMany(mappedBy = "goodsReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<GoodsReceiptDetail> details;
}
