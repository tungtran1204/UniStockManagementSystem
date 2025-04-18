package vn.unistock.unistockmanagementsystem.features.user.materialType;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.MaterialType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class MaterialTypeService {
    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialTypeMapper materialTypeMapper;

    public Page<MaterialTypeDTO> getAllMaterialTypes(Pageable pageable) {
        return materialTypeRepository.findAll(pageable).map(materialTypeMapper::toDTO);
    }

    public List<MaterialTypeDTO> getActiveMaterialTypes() {
        return materialTypeRepository.findAllByStatusTrue().stream()
                .map(materialTypeMapper::toDTO)
                .collect(Collectors.toList());
    }

    public MaterialTypeDTO getMaterialTypeById(Long id) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy danh mục vật tư"));
        return materialTypeMapper.toDTO(materialType);
    }

    @Transactional
    public MaterialTypeDTO createMaterialType(MaterialTypeDTO dto, String createdBy) {
        MaterialType materialType = materialTypeMapper.toEntity(dto);
        materialType.setCreatedBy(createdBy);
        materialType.setCreatedAt(LocalDateTime.now());
        materialType.setStatus(true);

        MaterialType saved = materialTypeRepository.save(materialType);
        return materialTypeMapper.toDTO(saved);
    }

    @Transactional
    public MaterialTypeDTO updateMaterialType(Long id, MaterialTypeDTO dto) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy danh mục vật tư"));

        materialType.setName(dto.getName());
        materialType.setDescription(dto.getDescription());
        materialType.setUpdatedAt(LocalDateTime.now());
        materialType.setUpdatedBy("Admin");

        MaterialType saved = materialTypeRepository.save(materialType);
        return materialTypeMapper.toDTO(saved);
    }

    @Transactional
    public MaterialTypeDTO toggleStatus(Long id, boolean status) {
        MaterialType materialType = materialTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy danh mục vật tư"));

        materialType.setStatus(status);
        MaterialType saved = materialTypeRepository.save(materialType);
        return materialTypeMapper.toDTO(saved);
    }
}
