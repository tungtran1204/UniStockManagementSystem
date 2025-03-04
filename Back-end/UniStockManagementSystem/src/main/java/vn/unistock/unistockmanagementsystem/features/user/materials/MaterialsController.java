package vn.unistock.unistockmanagementsystem.features.user.materials;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/materials") // ✅ API dành riêng cho User
@RequiredArgsConstructor
public class MaterialsController {
    private final MaterialsService materialsService;
    private final AzureBlobService azureBlobService;

    // 🟢 API lấy tất cả nguyên liệu
    @GetMapping
    public ResponseEntity<Page<MaterialsDTO>> getAllMaterials(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(materialsService.getAllMaterials(page, size));
    }

    // 🟢 API lấy thông tin nguyên liệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<MaterialsDTO> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialsService.getMaterialById(id));
    }

    // 🟢 API import nguyên liệu từ file Excel


    // 🟢 API bật/tắt trạng thái sử dụng
    @PatchMapping("/{id}/toggle-using")
    public ResponseEntity<Map<String, Object>> toggleUsingStatus(@PathVariable Long id) {
        log.info("📌 [DEBUG] Toggle using status for Material ID: {}", id);

        MaterialsDTO updatedMaterial = materialsService.toggleUsingStatus(id);

        Map<String, Object> response = new HashMap<>();
        response.put("materialId", id);
        response.put("isUsing", updatedMaterial.getIsUsing());

        log.info("✅ [SUCCESS] Updated isUsing: {}", updatedMaterial.getIsUsing());

        return ResponseEntity.ok(response);
    }

    // 🟢 API THÊM NGUYÊN LIỆU MỚI
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createMaterial(
            @RequestParam("materialCode") String materialCode,
            @RequestParam("materialName") String materialName,
            @RequestParam("description") String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "isUsingActive", required = false) Boolean isUsingActive,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        // ✅ Upload ảnh lên Azure nếu có
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = azureBlobService.uploadFile(image);
        }

        // ✅ Tạo DTO để lưu nguyên liệu
        MaterialsDTO materialDTO = new MaterialsDTO();
        materialDTO.setMaterialCode(materialCode);
        materialDTO.setMaterialName(materialName);
        materialDTO.setDescription(description);
        materialDTO.setUnitId(unitId);
        materialDTO.setTypeId(typeId);
        materialDTO.setIsUsing(isUsingActive);
        materialDTO.setImageUrl(imageUrl);

        // ✅ Gọi service để lưu nguyên liệu
        Material createdMaterial = materialsService.createMaterial(materialDTO, "Admin");
        return ResponseEntity.ok(createdMaterial);
    }

    // 🟢 API kiểm tra mã nguyên vật liệu đã tồn tại chưa
    @GetMapping("/check-material-code/{materialCode}")
    public ResponseEntity<Map<String, Boolean>> checkMaterialCode(
            @PathVariable String materialCode,
            @RequestParam(required = false) Long excludeId
    ) {
        boolean exists = materialsService.isMaterialCodeExists(materialCode, excludeId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    // 🟢 API CẬP NHẬT NGUYÊN LIỆU
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialsDTO> updateMaterial(
            @PathVariable Long id,
            @RequestParam("materialCode") String materialCode,
            @RequestParam("materialName") String materialName,
            @RequestParam("description") String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "isUsingActive", required = false) Boolean isUsingActive,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        MaterialsDTO materialDTO = new MaterialsDTO();
        materialDTO.setMaterialCode(materialCode);
        materialDTO.setMaterialName(materialName);
        materialDTO.setDescription(description);
        materialDTO.setUnitId(unitId);
        materialDTO.setTypeId(typeId);
        materialDTO.setIsUsing(isUsingActive);

        return ResponseEntity.ok(materialsService.updateMaterial(id, materialDTO, image));
    }
}