package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

@RestController
@RequestMapping("/api/unistock/user/warehouse")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<Warehouse> addWarehouse(@RequestBody WarehouseDTO warehouseDTO){
        Warehouse newWarehouse = warehouseService.addWarehouse(warehouseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(newWarehouse);
    }
}
