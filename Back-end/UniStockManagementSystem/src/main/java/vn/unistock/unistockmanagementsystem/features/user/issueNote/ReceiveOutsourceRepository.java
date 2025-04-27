package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.ReceiveOutsource;

import java.util.List;

@Repository
public interface ReceiveOutsourceRepository extends JpaRepository<ReceiveOutsource, Long> {
    List<ReceiveOutsource> findByStatusIn(List<ReceiveOutsource.OutsourceStatus> statuses);
}