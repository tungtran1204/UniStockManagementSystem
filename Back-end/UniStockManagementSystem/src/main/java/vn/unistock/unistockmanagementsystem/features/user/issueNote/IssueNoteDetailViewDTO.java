package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueNoteDetailViewDTO implements Serializable {
    private Long ginDetailsId;
    private Long ginId;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private Long materialId;
    private String materialCode;
    private String materialName;
    private Long productId;
    private String productCode;
    private String productName;
    private Double quantity;
    private Long unitId;
    private String unitName;
    private Long referenceId;
    private String referenceType;
}