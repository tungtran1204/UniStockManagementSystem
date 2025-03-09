package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequestDetail;

import java.util.List;

public interface PurchaseRequestDetailRepository extends JpaRepository<PurchaseRequestDetail, Long> {
    List<PurchaseRequestDetail> findByPurchaseRequestPurchaseRequestId(Long purchaseRequestId);
}
