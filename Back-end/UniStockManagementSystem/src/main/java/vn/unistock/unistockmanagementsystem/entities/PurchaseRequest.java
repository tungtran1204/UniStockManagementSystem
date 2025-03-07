package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchase_requests")
@Data
@EqualsAndHashCode(exclude = "purchaseRequestDetails")
@ToString(exclude = "purchaseRequestDetails")
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseRequestId;

    @Column(nullable = false, unique = true)
    private String purchaseRequestCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true) // Nullable để cho phép không liên kết
    private SalesOrder salesOrder;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private String status;

    @OneToMany(mappedBy = "purchaseRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PurchaseRequestDetail> purchaseRequestDetails;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}