package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "virtual_inventories")
public class VirtualInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sản phẩm được "đưa" vào kho ảo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Liên kết với đơn hàng (nếu bạn muốn “kho ảo” gắn với 1 đơn hàng cụ thể)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true)
    private SalesOrder salesOrder;

    // Số lượng tạm giữ cho đơn hàng này
    @Column(nullable = false)
    private Integer quantity;

}
