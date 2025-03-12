package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequestDTO {
    private Long purchaseRequestId;
    private String purchaseRequestCode;
    private Long partnerId;
    private String partnerName;
    private String address;
    private String phoneNumber;
    private String contactPerson;
    private String notes;
    private LocalDateTime createdDate;
    private String status;
    private List<PurchaseRequestDetailDTO> purchaseRequestDetails;
}
