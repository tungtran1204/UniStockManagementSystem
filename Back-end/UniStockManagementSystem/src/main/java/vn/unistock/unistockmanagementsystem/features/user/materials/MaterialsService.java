package vn.unistock.unistockmanagementsystem.features.user.materials;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.features.user.materialType.MaterialTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import vn.unistock.unistockmanagementsystem.storage.AzureBlobService;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialsService {
    private final MaterialsRepository materialsRepository;
    private final UnitRepository unitRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialsMapper materialsMapper = MaterialsMapper.INSTANCE;
    private final AzureBlobService azureBlobService;


    // 🟢 Lấy tất cả nguyên liệu có phân trang
    public Page<MaterialsDTO> getAllMaterials(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Material> materialPage = materialsRepository.findAll(pageable);
        return materialPage.map(materialsMapper::toDTO);
    }

    // 🟢 Tạo nguyên vật liệu mới
    public Material createMaterial(MaterialsDTO materialDTO, String createdBy) {
        Material material = new Material();
        material.setMaterialCode(materialDTO.getMaterialCode());
        material.setMaterialName(materialDTO.getMaterialName());
        material.setDescription(materialDTO.getDescription());

        if (materialDTO.getUnitId() != null) {
            material.setUnit(unitRepository.findById(materialDTO.getUnitId()).orElseThrow(() ->
                    new RuntimeException("Không tìm thấy đơn vị với ID: " + materialDTO.getUnitId())));        }
        if (materialDTO.getTypeId() != null) {
            material.setMaterialType(materialTypeRepository.findById(materialDTO.getTypeId()).orElseThrow(() ->
                    new RuntimeException("Không tìm thấy danh mục với ID: " + materialDTO.getTypeId())));        }

        // Đặt mặc định là true nếu không có giá trị
        material.setIsUsing(materialDTO.getIsUsing() != null ? materialDTO.getIsUsing() : true);

        material.setImageUrl(materialDTO.getImageUrl());
        material.setCreatedBy((createdBy));
        material.setCreatedAt(LocalDateTime.now());
        return materialsRepository.save(material);
    }

    // 🟢 Lấy nguyên vật liệu theo ID
    public MaterialsDTO getMaterialById(Long materialId) {
        Material material = materialsRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên vật liệu với ID: " + materialId));
        return materialsMapper.toDTO(material);
    }

    // 🟢 Bật/tắt trạng thái sử dụng nguyên vật liệu
    @Transactional
    public MaterialsDTO toggleUsingStatus(Long id) {
        Material material = materialsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nguyên vật liệu"));

        material.setIsUsing(!Boolean.TRUE.equals(material.getIsUsing())); // Đổi trạng thái an toàn
        Material savedMaterial = materialsRepository.save(material);
        return materialsMapper.toDTO(savedMaterial);
    }

    // 🟢 Kiểm tra mã nguyên vật liệu đã tồn tại chưa
    public boolean isMaterialCodeExists(String materialCode, Long excludeId) {
        if (excludeId != null) {
            return materialsRepository.existsByMaterialCodeAndMaterialIdNot(materialCode, excludeId);
        }
        return materialsRepository.existsByMaterialCode(materialCode);
    }

    // 🟢 Cập nhật nguyên vật liệu
    @Transactional
    public MaterialsDTO updateMaterial(Long id, MaterialsDTO updatedMaterial, MultipartFile newImage) throws IOException {
        Material material = materialsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nguyên vật liệu"));

        // Xử lý ảnh nếu có upload ảnh mới
        if (newImage != null && !newImage.isEmpty()) {
            if (material.getImageUrl() != null) {
                azureBlobService.deleteFile(material.getImageUrl());
            }
            String newImageUrl = azureBlobService.uploadFile(newImage);
            material.setImageUrl(newImageUrl);
        }

        // Cập nhật thông tin khác
        material.setMaterialCode(updatedMaterial.getMaterialCode());
        material.setMaterialName(updatedMaterial.getMaterialName());
        material.setDescription(updatedMaterial.getDescription());

        if (updatedMaterial.getUnitId() != null) {
            material.setUnit(unitRepository.findById(updatedMaterial.getUnitId()).orElse(null));
        }
        if (updatedMaterial.getTypeId() != null) {
            material.setMaterialType(materialTypeRepository.findById(updatedMaterial.getTypeId()).orElse(null));
        }

        // Cập nhật trạng thái sử dụng
        if (updatedMaterial.getIsUsing() != null) {
            material.setIsUsing(updatedMaterial.getIsUsing());
        }

        Material savedMaterial = materialsRepository.save(material);
        return materialsMapper.toDTO(savedMaterial);
    }
}
