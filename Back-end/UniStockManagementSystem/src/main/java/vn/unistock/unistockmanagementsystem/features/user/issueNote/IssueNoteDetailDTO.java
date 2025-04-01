package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueNoteDetailDTO {
    private Long ginDetailsId;
    private Long ginId;
    private Long warehouseId;
    private Long materialId;
    private Long productId;
    private Double quantity;
    private Long unitId;
}