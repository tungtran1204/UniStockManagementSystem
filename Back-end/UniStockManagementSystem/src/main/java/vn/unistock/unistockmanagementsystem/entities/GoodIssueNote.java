package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "good_issue_note")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoodIssueNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ginId;

    @Column(name = "gin_code", length = 50, unique = true, nullable = false)
    @NotBlank(message = "GIN code cannot be blank")
    private String ginCode;

    @ManyToOne
    @JoinColumn(name = "po_id", nullable = true)
    private PurchaseOrder purchaseOrder;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", nullable = false)
    private String category;

    @CreationTimestamp
    private LocalDateTime issueDate;
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    @NotNull(message = "Created by is required")
    private User createdBy;

    @OneToMany(mappedBy = "goodIssueNote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoodIssueDetail> details;
}

