package vn.unistock.unistockmanagementsystem.features.user.materials;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.Material;

@Repository
public interface MaterialsRepository extends JpaRepository<Material, Long> {
    boolean existsByMaterialCode(String materialCode);
    boolean existsByMaterialCodeAndMaterialIdNot(String materialCode, Long materialId);
    Page<Material> findAll(Pageable pageable);
}