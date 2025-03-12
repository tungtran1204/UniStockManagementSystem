package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptDetail;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptNote;

public interface ReceiptNoteDetailRepository extends JpaRepository<GoodReceiptDetail, Long> {
}
