package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;
import vn.unistock.unistockmanagementsystem.features.admin.role.RoleDTO;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unistock/user/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    @Autowired
    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<Warehouse> addWarehouse(@Valid @RequestBody WarehouseDTO warehouseDTO){
        Warehouse newWarehouse = warehouseService.addWarehouse(warehouseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(newWarehouse);
    }

    @GetMapping("/list")
    public ResponseEntity<List<Warehouse>> getAllActiveWarehouses(){
        List<Warehouse> warehouses = warehouseService.getAllActiveWarehouses();
        return ResponseEntity.ok(warehouses);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllWarehouses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Warehouse> warehousePage = warehouseService.getAllWarehouses(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", warehousePage.getContent());
        response.put("totalPages", warehousePage.getTotalPages());
        response.put("totalElements", warehousePage.getTotalElements());

        return ResponseEntity.ok(response);
    }


    @GetMapping("/{warehouseId}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long warehouseId){
        Warehouse warehouse = warehouseService.getWarehouseById(warehouseId);
        return ResponseEntity.ok(warehouse);
    }

    @PatchMapping("/{warehouseId}")
    public ResponseEntity<Warehouse> updateWarehouse(@Valid @PathVariable Long warehouseId, @RequestBody WarehouseDTO warehouseDTO){
        Warehouse updatedWarehouse = warehouseService.updateWarehouse(warehouseId, warehouseDTO);
        return ResponseEntity.ok(updatedWarehouse);
    }

    @PatchMapping("/{warehouseId}/status")
    public ResponseEntity<Warehouse> updateWarehouseStatus(@PathVariable Long warehouseId, @RequestBody Map<String, Boolean> status){
        Warehouse updatedWarehouse = warehouseService.updateWarehouseStatus(warehouseId, status.get("isActive"));
        return ResponseEntity.ok(updatedWarehouse);
    }

}
