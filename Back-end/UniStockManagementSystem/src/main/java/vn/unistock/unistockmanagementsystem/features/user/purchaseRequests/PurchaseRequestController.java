package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/unistock/user/purchase-requests")
@RequiredArgsConstructor
public class PurchaseRequestController {

    private static final Logger logger = LoggerFactory.getLogger(PurchaseRequestController.class);

    private final PurchaseRequestService purchaseRequestService;

    @GetMapping
    public ResponseEntity<Page<PurchaseRequestDTO>> getAllPurchaseRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Fetching purchase requests - Page: {}, Size: {}", page, size);
        PageRequest pageable = PageRequest.of(page, size);
        Page<PurchaseRequestDTO> requests = purchaseRequestService.getAllPurchaseRequests(pageable);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/next-code")
    public ResponseEntity<String> getNextRequestCode() {
        logger.info("Fetching next request code");
        String nextCode = purchaseRequestService.getNextRequestCode();
        logger.info("Next request code generated: {}", nextCode);
        return ResponseEntity.ok(nextCode);
    }

    @GetMapping("/{purchaseRequestId}")
    public ResponseEntity<PurchaseRequestDTO> getPurchaseRequestById(@PathVariable Long purchaseRequestId) {
        logger.info("Fetching purchase request by ID: {}", purchaseRequestId);
        PurchaseRequestDTO request = purchaseRequestService.getPurchaseRequestById(purchaseRequestId);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/manual")
    public ResponseEntity<PurchaseRequestDTO> createManualPurchaseRequest(@RequestBody PurchaseRequestDTO dto) {
        logger.info("Creating manual purchase request: {}", dto);
        PurchaseRequestDTO response = purchaseRequestService.createManualPurchaseRequest(dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{purchaseRequestId}/status")
    public ResponseEntity<PurchaseRequestDTO> updatePurchaseRequestStatus(
            @PathVariable Long purchaseRequestId,
            @RequestBody Map<String, String> statusRequest) {
        logger.info("Updating status of purchase request ID: {}", purchaseRequestId);
        String newStatus = statusRequest.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            throw new IllegalArgumentException("Trạng thái không được để trống");
        }
        PurchaseRequestDTO updatedRequest = purchaseRequestService.updatePurchaseRequestStatus(purchaseRequestId, newStatus);
        return ResponseEntity.ok(updatedRequest);
    }
}