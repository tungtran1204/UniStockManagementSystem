package vn.unistock.unistockmanagementsystem.features.user.materialType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.MaterialType;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialTypeRepository extends JpaRepository<MaterialType, Long> {

    Optional<MaterialType> findByNameIgnoreCase(String name);

}