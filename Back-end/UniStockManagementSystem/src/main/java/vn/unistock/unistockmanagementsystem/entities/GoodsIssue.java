package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "goods_issues")
public class GoodsIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Long issueId;

    private LocalDateTime issueDate;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    private String destination;

    @ManyToOne
    @JoinColumn(name = "issued_by")
    private User issuedBy;

    private String status;
    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 GoodsIssue -> nhiều GoodsIssueDetail
    @OneToMany(mappedBy = "goodsIssue", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<GoodsIssueDetail> details;
}
