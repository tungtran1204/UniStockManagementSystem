package vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.PartnerByType;
import vn.unistock.unistockmanagementsystem.entities.PartnerByTypeKey;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeService;

@Service
public class PartnerByTypeService {
    @Autowired
    private PartnerByTypeRepository partnerByTypeRepository;

    @Autowired
    private PartnerTypeService partnerTypeService;

    public PartnerByType createPartnerByCode(Partner partner, String partnerCode) {
        // Tìm PartnerType dựa trên prefix của mã đối tác
        String typeCode = partnerCode.replaceAll("[0-9]", ""); // Lấy phần chữ cái
        PartnerType partnerType = partnerTypeService.getPartnerTypeByCode(typeCode);

        if (partnerType == null) {
            throw new IllegalArgumentException("Không tìm thấy nhóm đối tác với mã: " + typeCode);
        }

        PartnerByTypeKey key = new PartnerByTypeKey(partner.getPartnerId(), partnerType.getTypeId());
        PartnerByType partnerByType = new PartnerByType();
        partnerByType.setId(key);
        partnerByType.setPartner(partner);
        partnerByType.setPartnerType(partnerType);
        partnerByType.setPartnerCode(partnerCode);

        return partnerByTypeRepository.save(partnerByType);
    }

    public String generatePartnerCode(Long typeId) {
        PartnerType partnerType = partnerTypeService.getPartnerTypeById(typeId);
        if (partnerType == null) {
            throw new IllegalArgumentException("Nhóm đối tác không tồn tại!");
        }

        // Đếm số lượng partner có cùng loại
        long count = partnerByTypeRepository.countByPartnerType(partnerType);

        // Tạo mã đối tác theo định dạng: <partnerTypeCode> + số lượng + 1
        String partnerTypeCode = partnerType.getTypeCode();
        return partnerTypeCode + String.format("%02d", count + 1);
    }
}

