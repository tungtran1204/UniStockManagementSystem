package vn.unistock.unistockmanagementsystem.features.user.partner;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.PartnerByType;
import vn.unistock.unistockmanagementsystem.entities.PartnerByTypeKey;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;
import vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType.PartnerByTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType.PartnerByTypeService;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnerService {
    private final PartnerRepository partnerRepository;
    private final PartnerMapper partnerMapper;
    private final PartnerTypeService partnerTypeService;
    private final PartnerByTypeService partnerByTypeService;

    // Lấy danh sách đối tác kèm danh sách loại đối tác
    public List<PartnerDTO> getAllPartners() {
        return partnerRepository.findAll().stream()
                .map(partnerMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Thêm mới đối tác
    public PartnerDTO createPartner(PartnerDTO partnerDTO) {
        if (partnerDTO.getPartnerCodes() == null || partnerDTO.getPartnerCodes().isEmpty()) {
            throw new IllegalArgumentException("NO_PARTNER_TYPE");
        }

        if (partnerRepository.existsByPartnerName(partnerDTO.getPartnerName())) {
            throw new IllegalArgumentException("DUPLICATE_NAME");
        }

        // Tạo mới Partner
        Partner partner = Partner.builder()
                .partnerName(partnerDTO.getPartnerName())
                .address(partnerDTO.getAddress())
                .phone(partnerDTO.getPhone())
                .email(partnerDTO.getEmail())
                .partnerTypes(new HashSet<>())
                .build();

        partner = partnerRepository.save(partner);

        for (String partnerCode : partnerDTO.getPartnerCodes()) {
            PartnerByType partnerByType = partnerByTypeService.createPartnerByCode(partner, partnerCode);
            partner.getPartnerTypes().add(partnerByType); // Thêm thay vì set toàn bộ
        }
        partner = partnerRepository.save(partner);

        return partnerMapper.toDTO(partner);
    }
}
