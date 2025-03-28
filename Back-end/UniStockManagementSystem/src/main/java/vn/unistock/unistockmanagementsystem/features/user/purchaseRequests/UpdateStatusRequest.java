package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;

@Data
public class UpdateStatusRequest {
    private String status;
    private String rejectionReason;
}