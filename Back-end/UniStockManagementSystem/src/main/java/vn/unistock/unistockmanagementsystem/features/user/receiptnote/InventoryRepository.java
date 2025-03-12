package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.Inventory;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory,Long> {
    Optional<Inventory> findByWarehouseAndMaterial(Warehouse warehouse, Material material);
    Optional<Inventory> findByWarehouseAndProduct(Warehouse warehouse, Product product);
}
