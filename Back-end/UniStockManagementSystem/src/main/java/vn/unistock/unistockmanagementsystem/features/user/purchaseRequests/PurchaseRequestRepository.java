package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    boolean existsByPurchaseRequestCode(String purchaseRequestCode);
}
