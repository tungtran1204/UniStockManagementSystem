package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses(){
        List<Warehouse> warehouses = warehouseService.getAllWarehouses();
        return ResponseEntity.ok(warehouses);
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
}
