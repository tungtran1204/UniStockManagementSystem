package vn.unistock.unistockmanagementsystem.features.partner.partnerType;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;

public interface PartnerTypeRepository extends JpaRepository<PartnerType, Long> {
    boolean existsByTypeCodeOrTypeName(String typeCode, String typeName);
}