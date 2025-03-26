package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequestDTO {
    private Long purchaseRequestId;
    private String purchaseRequestCode;
    private String notes;
    private LocalDateTime createdDate;
    private String status;
    private Long saleOrderId;
    private String saleOrderCode;
    private List<PurchaseRequestDetailDTO> purchaseRequestDetails;
}
