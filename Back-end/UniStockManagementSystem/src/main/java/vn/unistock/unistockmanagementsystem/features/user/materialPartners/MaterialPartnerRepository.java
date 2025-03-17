package vn.unistock.unistockmanagementsystem.features.user.materialPartners;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.MaterialPartner;

import java.util.List;

public interface MaterialPartnerRepository extends JpaRepository<MaterialPartner, Long> {
    @EntityGraph(attributePaths = {"partner"})
    List<MaterialPartner> findByMaterial(Material material);
}
