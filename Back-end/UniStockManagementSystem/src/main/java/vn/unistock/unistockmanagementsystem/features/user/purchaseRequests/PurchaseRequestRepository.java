package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    boolean existsByPurchaseRequestCode(String purchaseRequestCode);
    @Query("SELECT MAX(pr.purchaseRequestId) FROM PurchaseRequest pr")
    Long findMaxPurchaseRequestId();
}
