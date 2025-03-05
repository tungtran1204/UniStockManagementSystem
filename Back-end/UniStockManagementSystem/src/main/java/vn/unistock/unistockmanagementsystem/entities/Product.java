package vn.unistock.unistockmanagementsystem.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_code", nullable = false, unique = true)
    private String productCode;

    @Column(name = "product_name", nullable = false)
    private String productName;

    private String description;


    // ✅ Cho phép nullable để tránh lỗi khi dữ liệu thiếu
    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = true)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "type_id", nullable = true)
    private ProductType productType;

    // ✅ Chỉ lưu tên người tạo, không dùng Foreign Key
    @Column(name = "created_by", nullable = true)
    private String createdBy;

    @Column(name = "updated_by", nullable = true)
    private String updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(name = "is_production_active", nullable = false)
    private Boolean isProductionActive = true;  

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductMaterial> productMaterials;





}
