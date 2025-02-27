package vn.unistock.unistockmanagementsystem.warehouse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseDTO;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseMapper;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseRepository;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private WarehouseMapper warehouseMapper;

    @InjectMocks
    private WarehouseService warehouseService;

    private Warehouse warehouse;
    private WarehouseDTO warehouseDTO;

    @BeforeEach
    void setUp() {
        warehouse = new Warehouse();
        warehouse.setWarehouseId(1L);
        warehouse.setWarehouseName("Kho A");
        warehouse.setWarehouseCode("WH001");
        warehouse.setWarehouseDescription("Kho chính");

        warehouseDTO = new WarehouseDTO();
        warehouseDTO.setWarehouseName("Kho A");
        warehouseDTO.setWarehouseCode("WH001");
        warehouseDTO.setWarehouseDescription("Kho chính");
    }

    @Test
    void testAddWarehouse() {
        when(warehouseMapper.toEntity(any(WarehouseDTO.class))).thenReturn(warehouse);
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

        Warehouse result = warehouseService.addWarehouse(warehouseDTO);

        assertNotNull(result);
        assertEquals("Kho A", result.getWarehouseName());

        verify(warehouseMapper, times(1)).toEntity(any(WarehouseDTO.class));
        verify(warehouseRepository, times(1)).save(any(Warehouse.class));
    }

    @Test
    void testGetWarehouseById_Found() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));

        Warehouse result = warehouseService.getWarehouseById(1L);

        assertNotNull(result);
        assertEquals("Kho A", result.getWarehouseName());

        verify(warehouseRepository, times(1)).findById(1L);
    }

    @Test
    void testGetWarehouseById_NotFound() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            warehouseService.getWarehouseById(1L);
        });

        assertEquals("Không tìm thấy kho với ID được cung cấp", exception.getMessage());

        verify(warehouseRepository, times(1)).findById(1L);
    }

    @Test
    void testUpdateWarehouse() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        doNothing().when(warehouseMapper).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

        Warehouse result = warehouseService.updateWarehouse(1L, warehouseDTO);

        assertNotNull(result);
        assertEquals("Kho A", result.getWarehouseName());

        verify(warehouseRepository, times(1)).findById(1L);
        verify(warehouseMapper, times(1)).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
        verify(warehouseRepository, times(1)).save(any(Warehouse.class));
    }

    @Test
    void testDeleteWarehouse() {
        doNothing().when(warehouseRepository).deleteById(1L);

        warehouseService.deleteWarehouse(1L);

        verify(warehouseRepository, times(1)).deleteById(1L);
    }
}

