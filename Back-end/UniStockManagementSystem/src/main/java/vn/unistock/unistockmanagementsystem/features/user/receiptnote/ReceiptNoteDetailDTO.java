package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import jakarta.persistence.*;
import lombok.*;
import vn.unistock.unistockmanagementsystem.entities.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptNoteDetailDTO {
    private Long grnDetailsId;
    private GoodReceiptNote goodReceiptNote;
    private Warehouse warehouse;
    private Material material;
    private Product product;
    private Double quantity;
    private Unit unit;
    private Long referenceId;
    private GoodReceiptDetail.ReferenceType referenceType;
}
