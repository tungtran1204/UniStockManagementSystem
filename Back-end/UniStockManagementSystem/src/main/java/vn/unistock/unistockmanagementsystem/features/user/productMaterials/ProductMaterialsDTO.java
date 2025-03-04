package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductMaterialsDTO {
    private Long materialId;  // ID của nguyên vật liệu
    private String materialCode; // Mã NVL
    private String materialName; // Tên NVL
    private String unitName; // Đơn vị của NVL
    private int quantity;
}
