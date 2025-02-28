package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

import java.util.List;
import java.util.Optional;

public interface SaleOrdersRepository extends JpaRepository<SalesOrder, Long> {

    @Query("SELECT so FROM SalesOrder so LEFT JOIN FETCH so.details WHERE so.orderId = :orderId")
    Optional<SalesOrder> findByIdWithDetails(@Param("orderId") Long orderId);

    @Query("SELECT s FROM SalesOrder s WHERE s.status = ?1")
    List<SalesOrder> findByStatus(String status);

    @Query("SELECT s FROM SalesOrder s WHERE s.partner.partnerId = ?1")
    List<SalesOrder> findByCustomerId(Long partnerId);
}