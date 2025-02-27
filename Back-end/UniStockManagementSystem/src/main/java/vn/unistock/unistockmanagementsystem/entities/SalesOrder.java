package vn.unistock.unistockmanagementsystem.entities;


import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "sales_orders")
@EqualsAndHashCode(exclude = "details")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    // Nhiều đơn hàng -> 1 khách
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "order_date")
    private Date orderDate;

    // Ai tạo (nhiều order -> 1 user)
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdByUser;

    private String status;
    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 SalesOrder -> nhiều SalesOrderDetail
    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesOrderDetail> details;

    // Helper methods
    public void addDetail(SalesOrderDetail detail) {
        details.add(detail);
        detail.setSalesOrder(this);
    }

    public void removeDetail(SalesOrderDetail detail) {
        details.remove(detail);
        detail.setSalesOrder(null);
    }
}

