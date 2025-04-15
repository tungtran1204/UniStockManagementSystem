package vn.unistock.unistockmanagementsystem.features.user.materialType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.unistock.unistockmanagementsystem.entities.MaterialType;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/unistock/user/material-types")
@RequiredArgsConstructor
public class MaterialTypeController {
    private final MaterialTypeService materialTypeService;
    private final MaterialTypeMapper materialTypeMapper = MaterialTypeMapper.INSTANCE;

    @GetMapping
    public ResponseEntity<Page<MaterialTypeDTO>> getAllMaterialTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MaterialType> materialTypes = materialTypeService.getAllMaterialTypes(pageable);
        Page<MaterialTypeDTO> materialTypeDTOs = materialTypes.map(materialTypeMapper::toDTO);
        return ResponseEntity.ok(materialTypeDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialTypeDTO> getMaterialTypeById(@PathVariable Long id) {
        MaterialType materialType = materialTypeService.getMaterialTypeById(id);
        return ResponseEntity.ok(materialTypeMapper.toDTO(materialType));
    }

    @PostMapping
    public ResponseEntity<MaterialTypeDTO> createMaterialType(@RequestBody MaterialTypeDTO materialTypeDTO) {
        MaterialType materialType = materialTypeMapper.toEntity(materialTypeDTO);
        MaterialType createdMaterialType = materialTypeService.createMaterialType(materialType, "Admin");
        return ResponseEntity.ok(materialTypeMapper.toDTO(createdMaterialType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialTypeDTO> updateMaterialType(
            @PathVariable Long id,
            @RequestBody MaterialTypeDTO materialTypeDTO
    ) {
        MaterialType materialType = materialTypeMapper.toEntity(materialTypeDTO);
        MaterialType updatedMaterialType = materialTypeService.updateMaterialType(id, materialType);
        return ResponseEntity.ok(materialTypeMapper.toDTO(updatedMaterialType));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<MaterialTypeDTO> toggleStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> statusRequest
    ) {
        Boolean newStatus = statusRequest.get("status"); // Đổi key từ "using" thành "status"
        MaterialType updatedMaterialType = materialTypeService.toggleStatus(id, newStatus);
        return ResponseEntity.ok(materialTypeMapper.toDTO(updatedMaterialType));
    }

    @GetMapping("/active")
    public ResponseEntity<List<MaterialTypeDTO>> getActiveMaterialTypes() {
        List<MaterialType> materialTypes = materialTypeService.getActiveMaterialTypes();
        List<MaterialTypeDTO> materialTypeDTOs = materialTypes.stream()
                .map(materialTypeMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(materialTypeDTOs);
    }
}