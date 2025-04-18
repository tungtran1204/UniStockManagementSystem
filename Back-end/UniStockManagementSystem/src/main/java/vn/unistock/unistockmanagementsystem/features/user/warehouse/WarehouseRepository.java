package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.List;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    boolean existsByWarehouseName(String warehouseName);
    Page<Warehouse> findAll(Pageable pageable);
    List<Warehouse> findAllByIsActive(Boolean isActive);
    boolean existsByWarehouseCode(String warehouseCode);
    boolean existsByWarehouseCodeAndWarehouseIdNot(String warehouseCode, Long warehouseId);

    Warehouse findByWarehouseName(String warehouseName);
    Warehouse findByWarehouseId(Long warehouseId);
}
