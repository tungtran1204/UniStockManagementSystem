package vn.unistock.unistockmanagementsystem.features.user.purchaseOrder;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.PurchaseOrder;

import java.util.Optional;
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    @Query("SELECT p FROM PurchaseOrder p LEFT JOIN FETCH p.partner WHERE p.poId = :id")
    Optional<PurchaseOrder> findByIdWithPartner(@Param("id") Long id);

    // Thêm vào PurchaseOrderRepository
    @Query("SELECT p FROM PurchaseOrder p LEFT JOIN FETCH p.partner")
    Page<PurchaseOrder> findAllWithPartner(Pageable pageable);
}
