package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptDetail;
import vn.unistock.unistockmanagementsystem.entities.User;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptNoteDTO {
    private Long grnId;
    private String grnCode;
    private String description;
    private LocalDateTime receiptDate;
    private User createdBy;
    private List<GoodReceiptDetail> details;

}
