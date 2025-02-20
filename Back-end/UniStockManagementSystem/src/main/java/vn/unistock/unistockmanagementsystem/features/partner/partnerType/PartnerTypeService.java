package vn.unistock.unistockmanagementsystem.features.partner.partnerType;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnerTypeService {
    private final PartnerTypeRepository partnerTypeRepository;
    private final PartnerTypeMapper partnerTypeMapper;

    //Lấy danh sách loại đối tác
    public List<PartnerTypeDTO> getAllPartnerTypes() {
        return partnerTypeRepository.findAll().stream()
                .map(partnerTypeMapper::toDTO) //Dùng Mapper
                .collect(Collectors.toList());
    }

    //Thêm mới loại đối tác
    public PartnerTypeDTO addPartnerType(PartnerTypeDTO partnerTypeDTO) {
        PartnerType partnerType = partnerTypeMapper.toEntity(partnerTypeDTO);
        partnerType = partnerTypeRepository.save(partnerType);
        return partnerTypeMapper.toDTO(partnerType);
    }

    //Cập nhật loại đối tác
    public PartnerTypeDTO updatePartnerType(Long id, PartnerTypeDTO partnerTypeDTO) {
        PartnerType partnerType = partnerTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Loại đối tác không tồn tại"));

        partnerType.setTypeCode(partnerTypeDTO.getTypeCode());
        partnerType.setTypeName(partnerTypeDTO.getTypeName());
        partnerType.setStatus(partnerTypeDTO.getStatus());
        partnerType.setDescription(partnerTypeDTO.getDescription());

        partnerType = partnerTypeRepository.save(partnerType);
        return partnerTypeMapper.toDTO(partnerType);
    }

    public boolean existsByTypeCodeOrTypeName(String typeCode, String typeName) {
        return partnerTypeRepository.existsByTypeCodeOrTypeName(typeCode, typeName);
    }
}