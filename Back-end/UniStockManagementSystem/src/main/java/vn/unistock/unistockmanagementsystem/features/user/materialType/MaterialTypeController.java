package vn.unistock.unistockmanagementsystem.features.user.materialType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/material-types")
@RequiredArgsConstructor
public class MaterialTypeController {
    private final MaterialTypeService materialTypeService;

    @GetMapping
    public ResponseEntity<List<MaterialTypeDTO>> getAllMaterialTypes() {
        return ResponseEntity.ok(materialTypeService.getAllMaterialTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialTypeDTO> getMaterialTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(materialTypeService.getMaterialTypeById(id));
    }

    @PostMapping
    public ResponseEntity<MaterialTypeDTO> createMaterialType(@RequestBody MaterialTypeDTO materialTypeDTO) {
        return ResponseEntity.ok(materialTypeService.createMaterialType(materialTypeDTO, "Admin"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialTypeDTO> updateMaterialType(
            @PathVariable Long id,
            @RequestBody MaterialTypeDTO materialTypeDTO
    ) {
        return ResponseEntity.ok(materialTypeService.updateMaterialType(id, materialTypeDTO));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<MaterialTypeDTO> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(materialTypeService.toggleStatus(id));
    }

    @GetMapping("/active")
    public ResponseEntity<List<MaterialTypeDTO>> getActiveMaterialTypes() {
        return ResponseEntity.ok(materialTypeService.getActiveMaterialTypes());
    }
}