package vn.unistock.unistockmanagementsystem.features.user.purchaseOrder;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.unistock.unistockmanagementsystem.entities.PurchaseOrder;

import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    @Query("SELECT p FROM PurchaseOrder p LEFT JOIN FETCH p.partner WHERE p.poId = :id")
    Optional<PurchaseOrder> findByIdWithPartner(@Param("id") Long id);

    // tải tối thiểu dữ liệu cần thiết cho danh sách
    @Query(value = "SELECT p FROM PurchaseOrder p LEFT JOIN FETCH p.partner",
            countQuery = "SELECT COUNT(p) FROM PurchaseOrder p")
    Page<PurchaseOrder> findAllWithBasicInfo(Pageable pageable);

}
