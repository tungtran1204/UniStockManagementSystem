package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.Data;

@Data
public class MaterialItemDTO {
    private Long materialId;
    private String materialCode;
    private String materialName;
    private String unitName;
    private Integer quantity;
}