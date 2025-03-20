package vn.unistock.unistockmanagementsystem.features.user.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.Inventory;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory,Long> {
    Optional<Inventory> findByWarehouseAndMaterial(Warehouse warehouse, Material material);
    Optional<Inventory> findByWarehouseAndProduct(Warehouse warehouse, Product product);
    @Query("""
        SELECT COALESCE(SUM(i.quantity), 0)
        FROM Inventory i
        WHERE i.product.productId = :productId
    """)
    Double getTotalQuantityByProductId(@Param("productId") Long productId);

    @Query("SELECT new vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryByWarehouseDTO(" +
            "i.warehouse.warehouseId, i.warehouse.warehouseName, i.quantity) " +
            "FROM Inventory i " +
            "WHERE i.product.productId = :productId AND i.quantity > 0")
    List<InventoryByWarehouseDTO> findInventoryByProductId(@Param("productId") Long productId);

}
