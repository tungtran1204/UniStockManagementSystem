package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/sale-orders")
@RequiredArgsConstructor
public class SaleOrdersController {

    private final SaleOrdersService saleOrdersService;

    /**
     * Lấy danh sách tất cả đơn hàng
     */
    @GetMapping
    public ResponseEntity<List<SaleOrdersDTO>> getAllOrders() {
        List<SaleOrdersDTO> orders = saleOrdersService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<SaleOrdersDTO> getOrderById(@PathVariable Long orderId) {
        SaleOrdersDTO order = saleOrdersService.getOrderById(orderId);
        System.out.println("📝 Kiểm tra dữ liệu trả về: " + order);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy chi tiết đơn hàng theo ID kèm danh sách sản phẩm cho popup (Dùng cái này)
     */
    @GetMapping("/{orderId}/popup")
    public ResponseEntity<SaleOrdersDTO> getOrderDetailPopup(@PathVariable Long orderId) {
        SaleOrdersDTO orderDetails = saleOrdersService.getOrderDetailsPopup(orderId);
        return ResponseEntity.ok(orderDetails);
    }

    /**
     * Tạo mới một đơn hàng
     */
    @PostMapping("/add")
    public ResponseEntity<SaleOrdersDTO> createOrder(@RequestBody SaleOrdersDTO orderDTO) {
        SaleOrdersDTO createdOrder = saleOrdersService.createOrder(orderDTO);
        return ResponseEntity.ok(createdOrder);
    }

    /**
     * Cập nhật đơn hàng theo ID
     */
    @PutMapping("/{orderId}")
    public ResponseEntity<SaleOrdersDTO> updateOrder(
            @PathVariable("orderId") Long orderId,
            @RequestBody SaleOrdersDTO orderDTO) {

        SaleOrdersDTO updatedOrder = saleOrdersService.updateOrder(orderId, orderDTO);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Xóa đơn hàng theo ID
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("orderId") Long orderId) {
        saleOrdersService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
