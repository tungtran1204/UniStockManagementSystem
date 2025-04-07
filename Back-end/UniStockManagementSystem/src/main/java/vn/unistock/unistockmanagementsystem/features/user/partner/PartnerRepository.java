package vn.unistock.unistockmanagementsystem.features.user.partner;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;

import java.util.List;
import java.util.Optional;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    boolean existsByPartnerName(String partnerName);

    Page<Partner> findByPartnerTypes_PartnerType_typeId(Long typeId, Pageable pageable);

    @Query("SELECT p FROM Partner p JOIN p.partnerTypes pt WHERE pt.partnerCode = :partnerCode")
    Optional<Partner> findByPartnerCode(String partnerCode);

    @Query("SELECT mp.partner FROM MaterialPartner mp WHERE mp.material.materialId = :materialId")
    List<Partner> findPartnersByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT DISTINCT p FROM Partner p JOIN p.partnerTypes pt WHERE pt.partnerCode LIKE :prefix%")
    List<Partner> findByPartnerCodePrefix(@Param("prefix") String prefix);

}
