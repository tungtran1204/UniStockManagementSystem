package vn.unistock.unistockmanagementsystem.features.user.partner;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.unistock.unistockmanagementsystem.entities.Customer;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;

import java.util.Optional;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    boolean existsByPartnerName(String partnerName);

    Page<Partner> findByPartnerTypes_PartnerType_typeId(Long typeId, Pageable pageable);

    @Query("SELECT p FROM Partner p JOIN p.partnerTypes pt WHERE pt.partnerCode = :partnerCode")
    Optional<Partner> findByPartnerCode(String partnerCode);


}
