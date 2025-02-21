package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class SaleOrdersDTO {
    private Long orderId;
    private String customerName;
    private double totalAmount;
    private String status;
    private Date orderDate;
    private String note;


    //private Date createdAt;
    //private Date updatedAt;

    //private Long createdBy;
    //private Long updatedBy;

    public SaleOrdersDTO(Long orderId, String custName, double totalAmount, String status, Date orderDate, String note) {
        this.orderId = orderId;
        this.customerName = custName;
        this.totalAmount = totalAmount;
        this.status = status;
        this.orderDate = orderDate;
        this.note = note;
    }
}



