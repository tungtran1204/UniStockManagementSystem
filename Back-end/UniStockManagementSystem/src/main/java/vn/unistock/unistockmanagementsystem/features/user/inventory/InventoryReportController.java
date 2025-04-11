package vn.unistock.unistockmanagementsystem.features.user.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/stockmovement")
@RequiredArgsConstructor
public class InventoryReportController {
    private final InventoryTransactionService inventoryTransactionService;

    @GetMapping("/report")
    public ResponseEntity<List<StockMovementReportDTO>> getStockMovementReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,

            @RequestParam(required = false) String itemType, // "PRODUCT", "MATERIAL", hoặc null

            @RequestParam(required = false) Boolean hasMovementOnly // true: chỉ hàng có biến động
    ) {
        List<StockMovementReportDTO> result = inventoryTransactionService.getStockMovement(
                startDate, endDate, itemType, hasMovementOnly
        );
        return ResponseEntity.ok(result);
    }
}
