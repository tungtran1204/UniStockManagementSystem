package vn.unistock.unistockmanagementsystem.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    private String description;

    private Double price;

    // ✅ Cho phép nullable để tránh lỗi khi dữ liệu thiếu
    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = true)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "type_id", nullable = true)
    private ProductType productType;

    // ✅ Chỉ lưu tên người tạo, không dùng Foreign Key
    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
