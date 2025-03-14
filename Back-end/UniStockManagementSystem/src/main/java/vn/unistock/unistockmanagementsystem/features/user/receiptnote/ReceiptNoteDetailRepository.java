package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptDetail;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptNote;

@Repository
public interface ReceiptNoteDetailRepository extends JpaRepository<GoodReceiptDetail, Long> {
}
