package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductMaterialsDTO {
    private Long materialId;
    private String materialCode;
    private String materialName;
    private int quantity;
}
