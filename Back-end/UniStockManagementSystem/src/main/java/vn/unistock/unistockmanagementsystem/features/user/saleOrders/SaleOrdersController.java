package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/sale-orders")
@RequiredArgsConstructor
public class SaleOrdersController {

    private final SaleOrdersService saleOrdersService;


    @GetMapping
    public ResponseEntity<Page<SaleOrdersDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(saleOrdersService.getAllOrders(page, size));
    }

    @GetMapping("/next-code")
    public ResponseEntity<String> getNextOrderCode() {
        String nextCode = saleOrdersService.getNextOrderCode();
        return ResponseEntity.ok(nextCode);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<SaleOrdersDTO> getOrderById(@PathVariable Long orderId) {
        SaleOrdersDTO order = saleOrdersService.getOrderById(orderId);
        System.out.println("📝 Kiểm tra dữ liệu trả về: " + order);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<SaleOrdersDTO> createSaleOrder(@RequestBody SaleOrdersDTO saleOrdersDTO) {
        SaleOrdersDTO createdOrder = saleOrdersService.createSaleOrder(saleOrdersDTO);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

}
