package vn.unistock.unistockmanagementsystem.features.user.materialType;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.MaterialType;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialTypeService {
    private final MaterialTypeRepository materialTypeRepository;

    public Page<MaterialType> getAllMaterialTypes(Pageable pageable) {
        return materialTypeRepository.findAll(pageable);
    }

    public MaterialType getMaterialTypeById(Long id) {
        return materialTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại nguyên liệu với ID: " + id));
    }

    public MaterialType createMaterialType(MaterialType materialType, String createdBy) {
        materialTypeRepository.findByName(materialType.getName())
                .ifPresent(existingType -> {
                    throw new RuntimeException("Tên loại nguyên liệu '" + materialType.getName() + "' đã tồn tại!");
                });

        materialType.setCreatedBy("Admin"); // Gán trực tiếp "Admin", không cần parse
        materialType.setCreatedAt(LocalDateTime.now());
        materialType.setStatus(true);
        return materialTypeRepository.save(materialType);
    }

    @Transactional
    public MaterialType updateMaterialType(Long id, MaterialType materialType) {
        MaterialType existingMaterialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại nguyên liệu"));

        existingMaterialType.setName(materialType.getName());
        existingMaterialType.setDescription(materialType.getDescription());
        existingMaterialType.setStatus(materialType.isStatus());
        existingMaterialType.setUpdatedAt(LocalDateTime.now());

        return materialTypeRepository.save(existingMaterialType);
    }

    public MaterialType toggleStatus(Long id, Boolean newStatus) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại nguyên liệu"));

        materialType.setStatus(newStatus); // Đổi từ setUsing thành setStatus
        return materialTypeRepository.save(materialType);
    }

    public List<MaterialType> getActiveMaterialTypes() {
        return materialTypeRepository.findAllByStatusTrue(); // Đổi từ findAllByUsingTrue
    }
}