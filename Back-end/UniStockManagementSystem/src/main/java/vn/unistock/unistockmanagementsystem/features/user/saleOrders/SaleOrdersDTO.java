package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import lombok.*;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleOrdersDTO {

    private Long orderId;
    private Long custId;
    private String custName;
    private String status;
    private Date orderDate;
    private String note;
    private Set<SalesOrderDetailDTO> orderDetails = new HashSet<>();


    //private Date createdAt;
    //private Date updatedAt;

    //private Long createdBy;
    //private Long updatedBy;

    // Constructor for projection query
    public SaleOrdersDTO(Long orderId,Long custId, String name, Long totalAmount,
                         String status, Date orderDate, String note) {
        this.orderId = orderId;
        this.custId = custId;
        this.custName = name;
        this.status = status;
        this.orderDate = orderDate;
        this.note = note;
    }
}



