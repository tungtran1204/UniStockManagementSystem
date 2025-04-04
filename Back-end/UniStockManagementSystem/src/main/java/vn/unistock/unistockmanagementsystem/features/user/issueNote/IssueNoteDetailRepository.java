package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.GoodIssueDetail;

@Repository
public interface IssueNoteDetailRepository extends JpaRepository<GoodIssueDetail, Long> {
}