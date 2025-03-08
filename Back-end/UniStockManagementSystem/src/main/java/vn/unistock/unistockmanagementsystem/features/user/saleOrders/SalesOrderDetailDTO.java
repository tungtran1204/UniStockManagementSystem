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
    private String productCode;
    private String productName; // Added for UI display
    private Integer quantity;
    private String unitName; // Đơn vị tính


}