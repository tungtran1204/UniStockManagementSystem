package vn.unistock.unistockmanagementsystem.features.user.products;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsDTO;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/products")
@RequiredArgsConstructor
public class ProductsController {
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
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "isProductionActive", required = false, defaultValue = "true") Boolean isProductionActive,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("materials") String materialsJson) throws IOException {
        try {
            // Parse JSON materials
            ObjectMapper objectMapper = new ObjectMapper();
            List<ProductMaterialsDTO> materials = objectMapper.readValue(materialsJson, new TypeReference<List<ProductMaterialsDTO>>() {});

            // Tạo ProductsDTO
            ProductsDTO dto = new ProductsDTO();
            dto.setProductCode(productCode);
            dto.setProductName(productName);
            dto.setDescription(description);
            dto.setUnitId(unitId);
            dto.setTypeId(typeId);
            dto.setIsProductionActive(isProductionActive);
            dto.setImage(image);
            dto.setMaterials(materials);

            // Gọi service để tạo sản phẩm và định mức
            Product createdProduct = productsService.createProduct(dto, "Admin");
            return ResponseEntity.ok(createdProduct);
        } catch (Exception e) {
            log.error("Lỗi khi tạo sản phẩm với định mức: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi tạo sản phẩm: " + e.getMessage());
        }
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

    // 🟢 API CẬP NHẬT SẢN PHẨM
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("productCode") String productCode,
            @RequestParam("productName") String productName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "isProductionActive", required = false, defaultValue = "true") Boolean isProductionActive,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "materials", required = false) String materialsJson) throws IOException {
        try {
            // Parse JSON materials nếu có
            List<ProductMaterialsDTO> materials = null;
            if (materialsJson != null && !materialsJson.trim().isEmpty()) {
                ObjectMapper objectMapper = new ObjectMapper();
                materials = objectMapper.readValue(materialsJson, new TypeReference<List<ProductMaterialsDTO>>() {});
            } else {
                log.warn("materialsJson is null or empty, setting materials to null in DTO");
            }

            // Tạo ProductsDTO
            ProductsDTO dto = new ProductsDTO();
            dto.setProductCode(productCode);
            dto.setProductName(productName);
            dto.setDescription(description);
            dto.setUnitId(unitId);
            dto.setTypeId(typeId);
            dto.setIsProductionActive(isProductionActive);
            dto.setImage(image);
            dto.setMaterials(materials);

            // Gọi service để cập nhật sản phẩm và định mức
            ProductsDTO updatedProduct = productsService.updateProduct(id, dto, image);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật sản phẩm với định mức: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }
    }
}