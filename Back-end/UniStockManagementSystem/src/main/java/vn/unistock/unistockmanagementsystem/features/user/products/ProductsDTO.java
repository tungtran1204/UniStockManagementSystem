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
    private String productCode;
    private String productName;
    private String description;
    private Double price;

    private Long unitId;
    private String unitName;

    private Long typeId;
    private String typeName;

    private String createdBy;
    private String updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
