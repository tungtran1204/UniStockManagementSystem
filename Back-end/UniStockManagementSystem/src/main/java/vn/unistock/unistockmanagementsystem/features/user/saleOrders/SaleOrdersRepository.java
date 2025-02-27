package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

import java.util.List;

public interface SaleOrdersRepository extends JpaRepository<SalesOrder, Long> {



    @Query("SELECT s FROM SalesOrder s WHERE s.status = ?1")
    List<SalesOrder> findByStatus(String status);

    @Query("SELECT s FROM SalesOrder s WHERE s.customer.id = ?1")
    List<SalesOrder> findByCustomerId(Long customerId);
}