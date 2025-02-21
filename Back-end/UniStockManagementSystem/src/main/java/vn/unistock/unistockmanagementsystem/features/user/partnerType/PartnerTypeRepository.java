package vn.unistock.unistockmanagementsystem.features.user.partnerType;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;

public interface PartnerTypeRepository extends JpaRepository<PartnerType, Long> {
    boolean existsByTypeCode(String typeCode);

    boolean existsByTypeName(String typeName);
}