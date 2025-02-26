package vn.unistock.unistockmanagementsystem.features.user.rscates;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.ResourceCategory;

@Repository
public interface RsCatesRepository extends JpaRepository<ResourceCategory, Long> {
    boolean existsByName(String name);
}
