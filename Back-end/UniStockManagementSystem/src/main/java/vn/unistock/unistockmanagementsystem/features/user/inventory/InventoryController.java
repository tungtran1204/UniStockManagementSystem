package vn.unistock.unistockmanagementsystem.features.user.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    // GET /api/inventory/product/{productId}/total-quantity
    @GetMapping("/product/{productId}/total-quantity")
    public ResponseEntity<Double> getTotalQuantity(@PathVariable Long productId) {
        Double totalQty = inventoryService.getTotalQuantityOfProduct(productId);
        return ResponseEntity.ok(totalQty);
    }
    @GetMapping("/product/{productId}/warehouses")
    public ResponseEntity<List<InventoryByWarehouseDTO>> getInventoryDetailsByWarehouse(@PathVariable Long productId) {
        List<InventoryByWarehouseDTO> details = inventoryService.getInventoryDetailsByProduct(productId);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/report")
    public ResponseEntity<Page<InventoryReportDTO>> getInventoryReport(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getInventoryReport(page, size));
    }
}
