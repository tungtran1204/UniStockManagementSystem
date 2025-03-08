package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PurchaseRequestDTO {
    private Long purchaseRequestId;
    private String purchaseRequestCode;
    private String orderCode; // Mã đơn hàng (có thể null nếu không liên kết)
    private String productName;
    private LocalDateTime createdDate;
    private String status;
}