package vn.unistock.unistockmanagementsystem.features.user.productTypes;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.ProductType;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
}
