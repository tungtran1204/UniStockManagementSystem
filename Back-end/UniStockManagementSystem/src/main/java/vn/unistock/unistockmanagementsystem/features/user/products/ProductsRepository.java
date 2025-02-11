package vn.unistock.unistockmanagementsystem.features.user.products;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.Product;

import java.util.List;

@Repository
public interface ProductsRepository extends JpaRepository<Product, Long> {
    // Lấy sản phẩm do user tạo
    List<Product> findByCreatedBy(Long userId);
}
