package vn.unistock.unistockmanagementsystem.features.user.productTypes;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unistock/user/product-types")
@RequiredArgsConstructor
public class ProductTypeController {
    private final ProductTypeService productTypeService;

    @GetMapping
    public ResponseEntity<Page<ProductTypeDTO>> getAllProductTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductTypeDTO> productTypes = productTypeService.getAllProductTypes(pageable);
        return ResponseEntity.ok(productTypes);
    }

    @PatchMapping("/{typeId}/toggle-status")
    public ResponseEntity<ProductTypeDTO> toggleStatus(
            @PathVariable Long typeId,
            @RequestBody Map<String, Boolean> statusRequest
    ) {
        Boolean newStatus = statusRequest.get("status");
        return ResponseEntity.ok(productTypeService.toggleStatus(typeId, newStatus));
    }

    @PostMapping
    public ResponseEntity<ProductTypeDTO> createProductType(@RequestBody ProductTypeDTO productTypeDTO) {
        ProductTypeDTO createdProductType = productTypeService.createProductType(productTypeDTO);
        return ResponseEntity.ok(createdProductType);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductTypeDTO>> getActiveProductTypes() {
        return ResponseEntity.ok(productTypeService.getActiveProductTypes());
    }
}