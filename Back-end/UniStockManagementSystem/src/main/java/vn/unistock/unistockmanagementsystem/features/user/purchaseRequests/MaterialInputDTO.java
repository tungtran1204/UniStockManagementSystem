package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;

@Data
public class MaterialInputDTO {
    private Long materialId; // ID của vật tư
    private Integer quantity;
}
