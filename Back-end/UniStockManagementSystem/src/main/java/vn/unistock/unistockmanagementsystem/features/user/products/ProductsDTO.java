package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductsDTO {
    private Long productId;
    private String productName;
    private String description;
    private Double price;

    private Long unitId;
    private String unitName; // Hiển thị tên đơn vị

    private Long productTypeId;
    private String productTypeName; // Hiển thị tên loại sản phẩm

    private Long createdBy;
    private String createdByUsername;

    private Long updatedBy;
    private String updatedByUsername;
}

