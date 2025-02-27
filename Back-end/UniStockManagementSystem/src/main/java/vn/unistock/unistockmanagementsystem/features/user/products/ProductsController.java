package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.storage.AzureBlobService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/products") // ✅ API dành riêng cho User
@RequiredArgsConstructor
public class    ProductsController {
    private final ProductsService productsService;
    private final AzureBlobService azureBlobService;
    private final ExcelService excelService;

    // 🟢 API lấy tất cả sản phẩm
    @GetMapping
    public ResponseEntity<Page<ProductsDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productsService.getAllProducts(page, size));
    }

    // 🟢 API lấy thông tin sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductsDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productsService.getProductById(id));
    }



    // 🟢 API import sản phẩm từ file Excel
    @PostMapping("/import")
    public ResponseEntity<String> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            excelService.importProducts(file);
            return ResponseEntity.ok("✅ Import sản phẩm thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Lỗi: " + e.getMessage());
        }
    }

    // 🟢 API bật/tắt trạng thái sản xuất
    @PatchMapping("/{id}/toggle-production")
    public ResponseEntity<ProductsDTO> toggleProductionStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productsService.toggleProductionStatus(id));
    }


    // 🟢 API THÊM SẢN PHẨM MỚI
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(
            @RequestParam("productCode") String productCode,
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "productTypeId", required = false) Long productTypeId,
            @RequestParam(value = "isProductionActive", required = false) Boolean isProductionActive,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        // ✅ Upload ảnh lên Azure nếu có
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = azureBlobService.uploadFile(image);
        }

        // ✅ Tạo DTO để lưu sản phẩm
        ProductsDTO productDTO = new ProductsDTO();
        productDTO.setProductCode(productCode);
        productDTO.setProductName(productName);
        productDTO.setDescription(description);
        productDTO.setUnitId(unitId);
        productDTO.setTypeId(productTypeId);
        productDTO.setIsProductionActive(isProductionActive);
        productDTO.setImageUrl(imageUrl);

        // ✅ Gọi service để lưu sản phẩm
        Product createdProduct = productsService.createProduct(productDTO, "Admin");
        return ResponseEntity.ok(createdProduct);
    }


    @GetMapping("/check-product-code/{productCode}")
    public ResponseEntity<Map<String, Boolean>> checkProductCode(
            @PathVariable String productCode,
            @RequestParam(required = false) Long excludeId
    ) {
        boolean exists = productsService.isProductCodeExists(productCode, excludeId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }



    // 🟢 API CẬP NHẬT SẢN PHẨM MỚI
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductsDTO> updateProduct(
            @PathVariable Long id,
            @RequestParam("productCode") String productCode,
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "isProductionActive", required = false) Boolean isProductionActive,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        ProductsDTO productDTO = new ProductsDTO();
        productDTO.setProductCode(productCode);
        productDTO.setProductName(productName);
        productDTO.setDescription(description);
        productDTO.setUnitId(unitId);
        productDTO.setTypeId(typeId);
        productDTO.setIsProductionActive(isProductionActive);

        return ResponseEntity.ok(productsService.updateProduct(id, productDTO, image));
    }




}
