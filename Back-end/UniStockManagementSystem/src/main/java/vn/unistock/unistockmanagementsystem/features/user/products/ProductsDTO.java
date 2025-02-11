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
    private Long productTypeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
