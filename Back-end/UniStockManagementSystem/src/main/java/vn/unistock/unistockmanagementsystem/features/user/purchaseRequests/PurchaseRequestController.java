package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/purchase-requests")
@RequiredArgsConstructor
public class PurchaseRequestController {
    private final PurchaseRequestService purchaseRequestService;

    // Lấy danh sách yêu cầu mua vật tư
    @GetMapping
    public ResponseEntity<Page<PurchaseRequestDTO>> getAllPurchaseRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(purchaseRequestService.getAllPurchaseRequests(page, size));
    }

    // Lấy chi tiết yêu cầu mua vật tư
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRequestDetailDTO> getPurchaseRequestDetail(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseRequestService.getPurchaseRequestDetail(id));
    }

    // Tạo yêu cầu mua vật tư thủ công
    @PostMapping("/create-manual")
    public ResponseEntity<PurchaseRequestDTO> createPurchaseRequestManual(
            @RequestParam("purchaseRequestCode") String purchaseRequestCode,
            @RequestBody List<MaterialInputDTO> materials) {
        return ResponseEntity.ok(purchaseRequestService.createPurchaseRequestManual(purchaseRequestCode, materials));
    }
}