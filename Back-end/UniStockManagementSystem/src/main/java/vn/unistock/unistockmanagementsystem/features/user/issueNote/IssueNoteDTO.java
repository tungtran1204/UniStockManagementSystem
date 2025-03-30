package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueNoteDTO {
    private Long ginId;
    private String ginCode;
    private String description;
    private String category;
    private LocalDateTime issueDate;
    private Long soId;
    private Long createdBy;
    private List<IssueNoteDetailDTO> details;
    private List<String> paperEvidence;
}