package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequestDetailDTO {
    private Long purchaseRequestId;
    private String purchaseRequestCode;
    private String orderCode;
    private LocalDateTime createdDate;
    private String status;
    private List<MaterialItemDTO> materials; // Danh sách vật tư
}