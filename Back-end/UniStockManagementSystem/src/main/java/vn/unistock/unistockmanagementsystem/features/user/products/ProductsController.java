package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/products") // ✅ API dành riêng cho User
@RequiredArgsConstructor
public class ProductsController {
    private final ProductsService productsService;

    // 🟢 Lấy tất cả sản phẩm trong hệ thống (User có quyền xem tất cả)
    @GetMapping
    public ResponseEntity<List<ProductsDTO>> getAllProducts() {
        return ResponseEntity.ok(productsService.getAllProducts());
    }

    // 🟢 Lấy sản phẩm do chính User tạo
    @GetMapping("/{userId}")
    public ResponseEntity<List<ProductsDTO>> getUserProducts(@PathVariable Long userId) {
        return ResponseEntity.ok(productsService.getUserProducts(userId));
    }

    // 🟢 Tạo sản phẩm mới
    @PostMapping("/{userId}")
    public ResponseEntity<ProductsDTO> createProduct(@PathVariable Long userId, @RequestBody ProductsDTO dto) {
        return ResponseEntity.ok(productsService.createProduct(dto, userId));
    }

    // 🟢 Cập nhật sản phẩm của chính User
    @PutMapping("/{userId}/{productId}")
    public ResponseEntity<ProductsDTO> updateProduct(@PathVariable Long userId, @PathVariable Long productId, @RequestBody ProductsDTO dto) {
        return ResponseEntity.ok(productsService.updateProduct(productId, dto, userId));
    }

    // 🟢 Xóa sản phẩm của chính User
    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long userId, @PathVariable Long productId) {
        productsService.deleteProduct(productId, userId);
        return ResponseEntity.noContent().build();
    }
}
