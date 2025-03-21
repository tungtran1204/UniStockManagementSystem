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
import vn.unistock.unistockmanagementsystem.entities.MaterialPartner;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.features.user.materialPartners.MaterialPartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.materialPartners.MaterialPartnerService;
import vn.unistock.unistockmanagementsystem.features.user.materialType.MaterialTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialsService {
    private final MaterialsRepository materialsRepository;
    private final UnitRepository unitRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialsMapper materialsMapper;
    private final AzureBlobService azureBlobService;
    private final MaterialPartnerRepository materialPartnerRepository;
    private final PartnerRepository partnerRepository;
    private final MaterialPartnerService materialPartnerService;

    // 🟢 Lấy tất cả nguyên liệu có phân trang
    public Page<MaterialsDTO> getAllMaterials(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Material> materialPage = materialsRepository.findAll(pageable);
        return materialPage.map(materialsMapper::toDTO);
    }

    // 🟢 Tạo nguyên vật liệu mới
    @Transactional
    public MaterialsDTO createMaterial(MaterialsDTO materialDTO, String createdBy) {
        log.info("📌 [DEBUG] Creating Material: {}", materialDTO);

        Material material = new Material();
        material.setMaterialCode(materialDTO.getMaterialCode());
        material.setMaterialName(materialDTO.getMaterialName());
        material.setDescription(materialDTO.getDescription());

        if (materialDTO.getUnitId() != null) {
            material.setUnit(unitRepository.findById(materialDTO.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị với ID: " + materialDTO.getUnitId())));
        }
        if (materialDTO.getTypeId() != null) {
            material.setMaterialType(materialTypeRepository.findById(materialDTO.getTypeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + materialDTO.getTypeId())));
        }

        material.setIsUsing(materialDTO.getIsUsing() != null ? materialDTO.getIsUsing() : true);
        material.setImageUrl(materialDTO.getImageUrl());
        material.setCreatedBy(createdBy);
        material.setCreatedAt(LocalDateTime.now());

        Material savedMaterial = materialsRepository.save(material);

        // ✅ Kiểm tra danh sách supplierIds
        log.info("📌 [DEBUG] supplierIds received: {}", materialDTO.getSupplierIds());

        if (materialDTO.getSupplierIds() != null && !materialDTO.getSupplierIds().isEmpty()) {
            List<MaterialPartner> materialPartners = materialDTO.getSupplierIds().stream()
                    .map(supplierId -> {
                        Partner partner = partnerRepository.findById(supplierId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + supplierId));
                        return new MaterialPartner(null, savedMaterial, partner);
                    })
                    .collect(Collectors.toList());

            materialPartnerService.saveAll(materialPartners);
            savedMaterial.getMaterialPartners().addAll(materialPartners);
            log.info("✅ [SUCCESS] Saved MaterialPartners: {}", materialPartners.stream()
                    .map(mp -> "MaterialPartner{id=" + mp.getId() + "}")
                    .collect(Collectors.toList()));
        } else {
            log.warn("⚠️ [WARNING] No suppliers were provided or saved.");
        }

        return materialsMapper.toDTO(savedMaterial);
    }

    // 🟢 Lấy nguyên vật liệu theo ID
    public MaterialsDTO getMaterialById(Long materialId) {
        Material material = materialsRepository.findByIdWithPartners(materialId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư với ID: " + materialId));

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
        Material material = materialsRepository.findByIdWithPartners(id)
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

        // Cập nhật danh sách nhà cung cấp (MaterialPartner)
        // Bước 1: Xóa tất cả MaterialPartner hiện tại của vật tư
        material.getMaterialPartners().clear(); // Hibernate sẽ tự động xóa các bản ghi trong DB do orphanRemoval = true

        // Bước 2: Tạo mới MaterialPartner dựa trên supplierIds
        if (updatedMaterial.getSupplierIds() != null && !updatedMaterial.getSupplierIds().isEmpty()) {
            List<MaterialPartner> materialPartners = updatedMaterial.getSupplierIds().stream()
                    .map(supplierId -> {
                        Partner partner = partnerRepository.findById(supplierId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + supplierId));
                        return new MaterialPartner(null, material, partner);
                    })
                    .collect(Collectors.toList());

            materialPartnerService.saveAll(materialPartners);
            material.getMaterialPartners().addAll(materialPartners);
            log.info("✅ [SUCCESS] Updated MaterialPartners: {}", materialPartners.stream()
                    .map(mp -> "MaterialPartner{id=" + mp.getId() + "}")
                    .collect(Collectors.toList()));
        } else {
            log.warn("⚠️ [WARNING] No suppliers were provided or saved.");
        }

        Material savedMaterial = materialsRepository.save(material);
        return materialsMapper.toDTO(savedMaterial);
    }


    public List<MaterialsDTO> getMaterialsByPartner(Long partnerId) {
        List<Material> materials = materialsRepository.findByPartnerId(partnerId);
        return materials.stream()
                .map(materialsMapper::toDTO)
                .collect(Collectors.toList());
    }
}