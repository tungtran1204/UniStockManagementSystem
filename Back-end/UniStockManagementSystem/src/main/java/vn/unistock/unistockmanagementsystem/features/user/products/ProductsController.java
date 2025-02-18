package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/products") // ✅ API dành riêng cho User
@RequiredArgsConstructor
public class ProductsController {
    private final ProductsService productsService;
    private final ExcelService excelService;


    // 🟢 Lấy tất cả sản phẩm trong hệ thống (User có quyền xem tất cả)
    @GetMapping
    public ResponseEntity<List<ProductsDTO>> getAllProducts() {
        return ResponseEntity.ok(productsService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<ProductsDTO> createProduct(@RequestBody ProductsDTO productDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productsService.createProduct(productDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productsService.deleteProduct(id);
        return ResponseEntity.ok("Sản phẩm đã được xóa thành công.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductsDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductsDTO dto
    ) {
        return ResponseEntity.ok(productsService.updateProduct(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductsDTO> getProductById(@PathVariable Long id) {
        ProductsDTO product = productsService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            excelService.importProducts(file);
            return ResponseEntity.ok("✅ Import sản phẩm thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Lỗi: " + e.getMessage());
        }
    }




}
