package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.ProductMaterial;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductMaterialsRepository extends JpaRepository<ProductMaterial, Long> {

    List<ProductMaterial> findByProduct_ProductId(Long productId);
    Optional<ProductMaterial> findByProduct_ProductIdAndMaterial_MaterialId(Long productId, Long materialId);


    @Query("SELECT pm FROM ProductMaterial pm WHERE pm.product.id = :productId AND pm.material.id = :materialId")
    Optional<ProductMaterial> findByProductIdAndMaterialId(@Param("productId") Long productId, @Param("materialId") Long materialId);

    @Transactional
    @Modifying
    @Query("DELETE FROM ProductMaterial pm WHERE pm.product.id = :productId AND pm.material.id = :materialId")
    void deleteByProductIdAndMaterialId(@Param("productId") Long productId, @Param("materialId") Long materialId);
}
