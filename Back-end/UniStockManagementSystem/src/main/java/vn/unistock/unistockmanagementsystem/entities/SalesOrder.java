package vn.unistock.unistockmanagementsystem.entities;


import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "sales_orders")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    // Nhiều đơn hàng -> 1 khách
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

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
    @ToString.Exclude
    private List<SalesOrderDetail> details;
}

