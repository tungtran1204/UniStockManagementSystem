package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class WarehouseControllerTest {

    @Mock
    private WarehouseService warehouseService;

    @InjectMocks
    private WarehouseController warehouseController;

    private Warehouse warehouse;
    private WarehouseDTO warehouseDTO;

    @BeforeEach
    void setUp() {

        //expected result
        warehouse = new Warehouse();
        warehouse.setWarehouseId(1L);
        warehouse.setWarehouseName("Kho vật tư");
        warehouse.setWarehouseCode("KVT");
        warehouse.setWarehouseDescription("Kho lưu trữ vật tư");

        //input data
        warehouseDTO = new WarehouseDTO();
        warehouseDTO.setWarehouseName("Kho vật tư");
        warehouseDTO.setWarehouseCode("KVT");
        warehouseDTO.setWarehouseDescription("Kho lưu trữ vật tư");
    }

    @Test
    void testAddWarehouse() {
        when(warehouseService.addWarehouse(any(WarehouseDTO.class))).thenReturn(warehouse);

        ResponseEntity<Warehouse> response = warehouseController.addWarehouse(warehouseDTO);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Kho vật tư", response.getBody().getWarehouseName());

        verify(warehouseService, times(1)).addWarehouse(any(WarehouseDTO.class));
    }

//    @Test
//    void testGetAllWarehouses() {
//        List<Warehouse> warehouses = Arrays.asList(warehouse);
//        when(warehouseService.getAllWarehouses()).thenReturn(warehouses);
//
//        ResponseEntity<List<Warehouse>> response = warehouseController.getAllWarehouses();
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertNotNull(response.getBody());
//        assertEquals(1, response.getBody().size());
//
//        verify(warehouseService, times(1)).getAllWarehouses();
//    }

    @Test
    void testGetWarehouseById() {
        when(warehouseService.getWarehouseById(1L)).thenReturn(warehouse);

        ResponseEntity<Warehouse> response = warehouseController.getWarehouseById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getWarehouseId());

        verify(warehouseService, times(1)).getWarehouseById(1L);
    }

    @Test
    void testUpdateWarehouse() {
        when(warehouseService.updateWarehouse(eq(1L), any(WarehouseDTO.class))).thenReturn(warehouse);

        ResponseEntity<Warehouse> response = warehouseController.updateWarehouse(1L, warehouseDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Kho vật tư", response.getBody().getWarehouseName());

        verify(warehouseService, times(1)).updateWarehouse(eq(1L), any(WarehouseDTO.class));
    }
}

