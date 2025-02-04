package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "goods_issue_details")
public class GoodsIssueDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_detail_id")
    private Long issueDetailId;

    @ManyToOne
    @JoinColumn(name = "issue_id")
    private GoodsIssue goodsIssue;

    private String itemType; // 'MATERIAL' / 'PRODUCT'
    private Long itemId;
    private Double issuedQty;

    // Audit
    private LocalDateTime createdAt;
    private Long createdBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;
}

