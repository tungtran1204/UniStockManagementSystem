package vn.unistock.unistockmanagementsystem.features.user.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
      AND i.status = vn.unistock.unistockmanagementsystem.entities.Inventory.InventoryStatus.AVAILABLE
""")
    Double getTotalQuantityByProductId(@Param("productId") Long productId);


    @Query("SELECT new vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryByWarehouseDTO(" +
            "i.warehouse.warehouseId, i.warehouse.warehouseName, i.quantity) " +
            "FROM Inventory i " +
            "WHERE i.product.productId = :productId AND i.quantity > 0 " +
            "AND i.status = vn.unistock.unistockmanagementsystem.entities.Inventory.InventoryStatus.AVAILABLE")
    List<InventoryByWarehouseDTO> findInventoryByProductId(@Param("productId") Long productId);

    //query for inventory report
    @Query("""
SELECT new vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryReportDTO(
    CASE WHEN m IS NOT NULL THEN m.materialCode ELSE p.productCode END,
    CASE WHEN m IS NOT NULL THEN m.materialName ELSE p.productName END,
    CASE WHEN m IS NOT NULL THEN m.isUsing ELSE p.isProductionActive END,
    CASE WHEN m IS NOT NULL THEN u1.unitName ELSE u2.unitName END,
    SUM(CASE WHEN i.status = vn.unistock.unistockmanagementsystem.entities.Inventory.InventoryStatus.AVAILABLE THEN i.quantity ELSE 0 END),
    SUM(CASE WHEN i.status = vn.unistock.unistockmanagementsystem.entities.Inventory.InventoryStatus.RESERVED THEN i.quantity ELSE 0 END),
    SUM(i.quantity),
    w.warehouseCode,
    w.warehouseName,
    w.warehouseId,
    CASE WHEN m IS NOT NULL THEN 'MATERIAL' ELSE 'PRODUCT' END,
    CASE WHEN p IS NOT NULL THEN p.productType.typeId ELSE NULL END,
    CASE WHEN m IS NOT NULL THEN m.materialType.materialTypeId ELSE NULL END
)
FROM Inventory i
LEFT JOIN i.material m
LEFT JOIN i.product p
LEFT JOIN m.unit u1
LEFT JOIN p.unit u2
JOIN i.warehouse w
GROUP BY 
    CASE WHEN m IS NOT NULL THEN m.materialCode ELSE p.productCode END,
    CASE WHEN m IS NOT NULL THEN m.materialName ELSE p.productName END,
    CASE WHEN m IS NOT NULL THEN m.isUsing ELSE p.isProductionActive END,
    CASE WHEN m IS NOT NULL THEN u1.unitName ELSE u2.unitName END,
    w.warehouseCode,
    w.warehouseName,
    w.warehouseId,
    CASE WHEN m IS NOT NULL THEN 'MATERIAL' ELSE 'PRODUCT' END,
    CASE WHEN p IS NOT NULL THEN p.productType.typeId ELSE NULL END,
    CASE WHEN m IS NOT NULL THEN m.materialType.materialTypeId ELSE NULL END
""")
    List<InventoryReportDTO> getInventoryReportRaw();

    default Page<InventoryReportDTO> getInventoryReport(Pageable pageable) {
        List<InventoryReportDTO> all = getInventoryReportRaw();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), all.size());
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    // tổng số lượng tồn kho - kho phế liệu
    @Query("""
SELECT COALESCE(SUM(i.quantity), 0)
FROM Inventory i
WHERE i.product.productId = :productId
AND i.warehouse.warehouseName NOT LIKE '%phế liệu%'
""")
    Double getTotalQuantityAcrossWarehousesByProduct(@Param("productId") Long productId);

    @Query("""
SELECT COALESCE(SUM(i.quantity), 0)
FROM Inventory i
WHERE i.material.materialId = :materialId
AND i.warehouse.warehouseName NOT LIKE '%phế liệu%'
""")
    Double getTotalQuantityAcrossWarehousesByMaterial(@Param("materialId") Long materialId);


}
