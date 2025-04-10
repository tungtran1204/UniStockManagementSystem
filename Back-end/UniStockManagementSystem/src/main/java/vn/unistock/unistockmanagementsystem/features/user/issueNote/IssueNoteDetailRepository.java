package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.GoodIssueDetail;

@Repository
public interface IssueNoteDetailRepository extends JpaRepository<GoodIssueDetail, Long> {
    @Query("""
    SELECT new vn.unistock.unistockmanagementsystem.features.user.issueNote.IssueNoteReportDTO(
        n.ginCode,
        n.category,
        n.issueDate,
        w.warehouseName,
        m.materialCode,
        m.materialName,
        p.productCode,
        p.productName,
        u.unitName,
        d.quantity
    )
    FROM GoodIssueDetail d
    JOIN d.goodIssueNote n
    JOIN d.warehouse w
    LEFT JOIN d.material m
    LEFT JOIN d.product p
    LEFT JOIN d.unit u
    ORDER BY n.issueDate DESC
""")
    Page<IssueNoteReportDTO> getIssueNoteReport(Pageable pageable);
}