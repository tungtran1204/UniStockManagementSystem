package vn.unistock.unistockmanagementsystem.features.user.materialType;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.MaterialType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialTypeService {
    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialTypeMapper materialTypeMapper = MaterialTypeMapper.INSTANCE;

    public List<MaterialTypeDTO> getAllMaterialTypes() {
        return materialTypeRepository.findAll().stream()
                .map(materialTypeMapper::toDTO)
                .collect(Collectors.toList());
    }

    public MaterialTypeDTO getMaterialTypeById(Long id) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại nguyên liệu với ID: " + id));
        return materialTypeMapper.toDTO(materialType);
    }

    public MaterialTypeDTO createMaterialType(MaterialTypeDTO materialTypeDTO, String createdBy) {
        MaterialType materialType = materialTypeMapper.toEntity(materialTypeDTO);
        materialType.setCreatedBy(Long.parseLong(createdBy));
        materialType.setCreatedAt(LocalDateTime.now());

        MaterialType savedMaterialType = materialTypeRepository.save(materialType);
        return materialTypeMapper.toDTO(savedMaterialType);
    }

    @Transactional
    public MaterialTypeDTO updateMaterialType(Long id, MaterialTypeDTO materialTypeDTO) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại nguyên liệu"));

        materialType.setName(materialTypeDTO.getName());
        materialType.setDescription(materialTypeDTO.getDescription());
        materialType.setUsing(materialTypeDTO.isUsing());
        materialType.setUpdatedAt(LocalDateTime.now());

        MaterialType updatedMaterialType = materialTypeRepository.save(materialType);
        return materialTypeMapper.toDTO(updatedMaterialType);
    }

    public MaterialTypeDTO toggleStatus(Long id) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại nguyên liệu"));

        materialType.setUsing(!materialType.isUsing());
        MaterialType savedMaterialType = materialTypeRepository.save(materialType);
        return materialTypeMapper.toDTO(savedMaterialType);
    }
}