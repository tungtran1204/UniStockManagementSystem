package vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.PartnerByType;
import vn.unistock.unistockmanagementsystem.entities.PartnerByTypeKey;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;

public interface PartnerByTypeRepository extends JpaRepository<PartnerByType, PartnerByTypeKey> {
    int countByPartnerType(PartnerType partnerType);
}
