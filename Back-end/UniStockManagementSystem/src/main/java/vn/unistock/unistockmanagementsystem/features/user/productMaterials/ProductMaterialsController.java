package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/product-materials") // ✅ API dành riêng cho User
public class ProductMaterialsController {
    private final ProductMaterialsService productMaterialService;

    public ProductMaterialsController(ProductMaterialsService productMaterialService) {
        this.productMaterialService = productMaterialService;
    }

    //Show định mức
    @GetMapping("/{productId}")
    public ResponseEntity<List<ProductMaterialsDTO>> getMaterialsByProduct(@PathVariable Long productId) {
        List<ProductMaterialsDTO> materials = productMaterialService.getMaterialsByProduct(productId);
        return ResponseEntity.ok(materials);
    }

    //Lưu định mức
    @PostMapping("/{productId}/materials")
    public ResponseEntity<String> saveProductMaterials(
            @PathVariable Long productId,
            @RequestBody List<ProductMaterialsDTO> materialsDTOList) {

        productMaterialService.saveProductMaterials(productId, materialsDTOList);
        return ResponseEntity.ok("Định mức nguyên vật liệu đã được cập nhật!");
    }



    @DeleteMapping("/{productId}/materials/{materialId}")
    public ResponseEntity<?> deleteMaterialFromProduct(@PathVariable Long productId, @PathVariable Long materialId) {
        try {
            productMaterialService.deleteProductMaterial(productId, materialId);
            return ResponseEntity.ok("Xóa vật tư thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
