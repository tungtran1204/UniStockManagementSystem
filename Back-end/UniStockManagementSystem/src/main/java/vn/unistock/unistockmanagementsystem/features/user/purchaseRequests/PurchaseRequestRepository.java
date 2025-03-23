package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    boolean existsByPurchaseRequestCode(String purchaseRequestCode);
    @Query("SELECT MAX(pr.purchaseRequestId) FROM PurchaseRequest pr")
    Long findMaxPurchaseRequestId();

    @Query("SELECT pr FROM PurchaseRequest pr JOIN FETCH pr.purchaseRequestDetails prd JOIN FETCH prd.material m JOIN FETCH m.unit JOIN FETCH prd.partner WHERE pr.purchaseRequestId = :id")
    PurchaseRequest findByIdWithDetails(@Param("id") Long id);
}
