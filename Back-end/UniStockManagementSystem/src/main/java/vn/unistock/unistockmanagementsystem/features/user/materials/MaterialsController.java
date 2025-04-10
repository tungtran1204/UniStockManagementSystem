package vn.unistock.unistockmanagementsystem.features.user.materials;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/materials")
@RequiredArgsConstructor
public class MaterialsController {
    private final MaterialsService materialsService;
    private final AzureBlobService azureBlobService;
    private final MaterialExcelService materialExcelService;
    // 🟢 API lấy tất cả nguyên liệu
    @GetMapping
    public ResponseEntity<Page<MaterialsDTO>> getAllMaterials(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(materialsService.getAllMaterials(page, size));
    }

    @GetMapping("/by-partner/{partnerId}")
    public ResponseEntity<List<MaterialsDTO>> getMaterialsByPartner(@PathVariable Long partnerId) {
        List<MaterialsDTO> materials = materialsService.getMaterialsByPartner(partnerId);
        return ResponseEntity.ok(materials);
    }

    // 🟢 API lấy thông tin nguyên liệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<MaterialsDTO> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialsService.getMaterialById(id));
    }

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
    public ResponseEntity<MaterialsDTO> createMaterial(
            @RequestParam("materialCode") String materialCode,
            @RequestParam("materialName") String materialName,
            @RequestParam("description") String description,
            @RequestParam(value = "unitId", required = false) Long unitId,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "isUsingActive", required = false) Boolean isUsingActive,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "supplierIds", required = false) List<Long> supplierIds
    ) throws IOException {
        // ✅ Upload ảnh lên Azure nếu có
        String imageUrl = (image != null && !image.isEmpty()) ? azureBlobService.uploadFile(image) : null;

        // ✅ Tạo DTO để lưu nguyên liệu
        MaterialsDTO materialDTO = new MaterialsDTO();
        materialDTO.setMaterialCode(materialCode);
        materialDTO.setMaterialName(materialName);
        materialDTO.setDescription(description);
        materialDTO.setUnitId(unitId);
        materialDTO.setTypeId(typeId);
        materialDTO.setIsUsing(isUsingActive);
        materialDTO.setImageUrl(imageUrl);
        materialDTO.setSupplierIds(supplierIds);

        // ✅ Gọi service để lưu nguyên liệu và trả về DTO
        MaterialsDTO createdMaterialDTO = materialsService.createMaterial(materialDTO, "Admin");

        return ResponseEntity.ok(createdMaterialDTO);
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
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "supplierIds", required = false) List<Long> supplierIds
    ) throws IOException {
        MaterialsDTO materialDTO = new MaterialsDTO();
        materialDTO.setMaterialCode(materialCode);
        materialDTO.setMaterialName(materialName);
        materialDTO.setDescription(description);
        materialDTO.setUnitId(unitId);
        materialDTO.setTypeId(typeId);
        materialDTO.setIsUsing(isUsingActive);
        materialDTO.setSupplierIds(supplierIds);

        return ResponseEntity.ok(materialsService.updateMaterial(id, materialDTO, image));
    }

    @PostMapping(value = "/preview-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<MaterialPreviewDTO>> previewImport(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(materialExcelService.previewImportMaterials(file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of(
                    new MaterialPreviewDTO() {{
                        setValid(false);
                        setErrorMessage("Lỗi khi kiểm tra file: " + e.getMessage());
                    }}
            ));
        }
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> importMaterials(@RequestParam("file") MultipartFile file) {
        try {
            List<MaterialPreviewDTO> previewList = materialExcelService.previewImportMaterials(file);
            boolean hasErrors = previewList.stream().anyMatch(dto -> !dto.isValid());
            if (hasErrors) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("❌ File chứa dòng không hợp lệ, không thể import.");
            }

            String result = materialExcelService.importMaterials(file);
            return ResponseEntity.ok("✅ " + result);
        } catch (Exception e) {
            log.error("❌ Lỗi khi import vật tư:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Lỗi: " + e.getMessage());
        }
    }



    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            ByteArrayInputStream stream = materialExcelService.generateMaterialImportTemplate();
            byte[] content = stream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=template_import_vattu.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(content);
        } catch (IOException e) {
            log.error("❌ Lỗi khi tạo file template import vật tư: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportMaterials() {
        try {
            ByteArrayInputStream stream = materialExcelService.exportMaterialsToExcel();
            byte[] content = stream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=danh_sach_vat_tu.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }




}
