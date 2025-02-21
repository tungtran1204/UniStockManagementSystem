package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;
import vn.unistock.unistockmanagementsystem.features.user.saleOrders.SaleOrdersDTO;

import java.util.List;
import java.util.Date;

public interface SaleOrdersRepository extends JpaRepository<SalesOrder, Long> {

    @Query("""
    SELECT new vn.unistock.unistockmanagementsystem.features.user.saleOrders.SaleOrdersDTO(
        o.orderId,
        c.custName,
        SUM(d.quantity * d.unitPrice - d.discount),
        o.status,
        o.orderDate,
        o.note )
    FROM SalesOrder o
    LEFT JOIN Customer c ON o.customer.id = c.id
    LEFT JOIN SalesOrderDetail d ON d.salesOrder.orderId = o.orderId
    GROUP BY o.orderId, c.custName, o.status, o.orderDate
    """)
    List<SaleOrdersDTO> findAllOrdersWithDetails();
}