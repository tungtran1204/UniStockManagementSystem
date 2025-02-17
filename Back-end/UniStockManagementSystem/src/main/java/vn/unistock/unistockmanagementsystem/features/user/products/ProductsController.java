package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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


    @PostMapping
    public ResponseEntity<ProductsDTO> createProduct(
            @RequestBody ProductsDTO productDTO,
            @AuthenticationPrincipal UserDetails userDetails) { // ✅ Lấy user từ token JWT
        String username = userDetails.getUsername();
        ProductsDTO createdProduct = productsService.createProduct(productDTO, username);
        return ResponseEntity.ok(createdProduct);
    }

}
