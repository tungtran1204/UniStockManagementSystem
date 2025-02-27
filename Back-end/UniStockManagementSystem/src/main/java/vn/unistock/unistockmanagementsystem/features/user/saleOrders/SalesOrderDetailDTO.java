package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrderDetailDTO {

    private Long orderDetailId;
    private Long orderId;
    private Long productId;
    private String productName; // Added for UI display
    private Integer quantity;
    private Double unitPrice;
    private Double discount;
    private Double lineTotal; // Calculated field for UI display

    // Audit fields
    private LocalDateTime createdAt;
    private Long createdBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}