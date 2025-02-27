package vn.unistock.unistockmanagementsystem.features.user.partner;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.Partner;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    boolean existsByPartnerName(String partnerName);
}
