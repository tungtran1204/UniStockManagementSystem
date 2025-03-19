package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;
import vn.unistock.unistockmanagementsystem.validation.CommonStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
        warehouse.setWarehouseCode("WH001");
        warehouse.setWarehouseName("Kho Hàng 1");
        warehouse.setWarehouseDescription("Mô tả kho hàng 1");
        warehouse.setIsActive(true);

        warehouseDTO = WarehouseDTO.builder()
                .warehouseId(1L)
                .warehouseCode("WH001")
                .warehouseName("Kho Hàng 1")
                .warehouseDescription("Mô tả kho hàng 1")
                .status(CommonStatus.ACTIVE)
                .build();
    }

    @Nested
    @DisplayName("addWarehouse Tests")
    class AddWarehouseTests {

        @Test
        @DisplayName("Thêm kho thành công với dữ liệu hợp lệ")
        void testAddWarehouse_Success() {
            // Arrange
            when(warehouseRepository.existsByWarehouseName(anyString())).thenReturn(false);
            when(warehouseMapper.toEntity(any(WarehouseDTO.class))).thenReturn(warehouse);
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

            // Act
            Warehouse result = warehouseService.addWarehouse(warehouseDTO);

            // Assert
            assertNotNull(result);
            assertEquals(warehouse.getWarehouseName(), result.getWarehouseName());
            verify(warehouseRepository).existsByWarehouseName(warehouseDTO.getWarehouseName());
            verify(warehouseMapper).toEntity(warehouseDTO);
            verify(warehouseRepository).save(warehouse);
        }

        @Test
        @DisplayName("Thêm kho với các trường tối thiểu")
        void testAddWarehouse_MinimumFields() {
            // Arrange
            WarehouseDTO minimalDTO = WarehouseDTO.builder()
                    .warehouseName("Kho Tối Thiểu")
                    .build();

            Warehouse minimalWarehouse = new Warehouse();
            minimalWarehouse.setWarehouseName("Kho Tối Thiểu");

            when(warehouseRepository.existsByWarehouseName(anyString())).thenReturn(false);
            when(warehouseMapper.toEntity(any(WarehouseDTO.class))).thenReturn(minimalWarehouse);
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(minimalWarehouse);

            // Act
            Warehouse result = warehouseService.addWarehouse(minimalDTO);

            // Assert
            assertNotNull(result);
            assertEquals(minimalDTO.getWarehouseName(), result.getWarehouseName());
            verify(warehouseRepository).save(minimalWarehouse);
        }

        @Test
        @DisplayName("Thêm kho với tên trùng lặp (nên ném RuntimeException)")
        void testAddWarehouse_DuplicateName() {
            // Arrange
            when(warehouseRepository.existsByWarehouseName(anyString())).thenReturn(true);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                warehouseService.addWarehouse(warehouseDTO);
            });

            assertEquals("Kho đã tồn tại", exception.getMessage());
            verify(warehouseRepository).existsByWarehouseName(warehouseDTO.getWarehouseName());
            verify(warehouseMapper, never()).toEntity(any(WarehouseDTO.class));
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Thêm kho với DTO là null")
        void testAddWarehouse_NullDTO() {
            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.addWarehouse(null);
            });

            verify(warehouseRepository, never()).existsByWarehouseName(anyString());
            verify(warehouseMapper, never()).toEntity(any(WarehouseDTO.class));
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Thêm kho với tên là null")
        void testAddWarehouse_NullName() {
            // Arrange
            WarehouseDTO nullNameDTO = WarehouseDTO.builder().warehouseName(null).build();

            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.addWarehouse(nullNameDTO);
            });
        }

        @Test
        @DisplayName("Thêm kho với tên rất dài")
        void testAddWarehouse_VeryLongName() {
            // Arrange
            String longName = "a".repeat(255); // Assuming 255 is the max length
            WarehouseDTO longNameDTO = WarehouseDTO.builder().warehouseName(longName).build();

            Warehouse longNameWarehouse = new Warehouse();
            longNameWarehouse.setWarehouseName(longName);

            when(warehouseRepository.existsByWarehouseName(anyString())).thenReturn(false);
            when(warehouseMapper.toEntity(any(WarehouseDTO.class))).thenReturn(longNameWarehouse);
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(longNameWarehouse);

            // Act
            Warehouse result = warehouseService.addWarehouse(longNameDTO);

            // Assert
            assertNotNull(result);
            assertEquals(longName, result.getWarehouseName());
        }
    }

    @Nested
    @DisplayName("getAllWarehouses Tests")
    class GetAllWarehousesTests {

        @Test
        @DisplayName("Lấy danh sách kho trang đầu tiên với kích thước mặc định")
        void testGetAllWarehouses_FirstPageDefaultSize() {
            // Arrange
            List<Warehouse> warehouses = List.of(warehouse);
            Page<Warehouse> warehousePage = new PageImpl<>(warehouses);

            when(warehouseRepository.findAll(any(Pageable.class))).thenReturn(warehousePage);

            // Act
            Page<Warehouse> result = warehouseService.getAllWarehouses(0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getContent().size());
            assertEquals(warehouse, result.getContent().get(0));
            verify(warehouseRepository).findAll(PageRequest.of(0, 10));
        }

        @Test
        @DisplayName("Lấy danh sách kho trang giữa với kích thước tùy chỉnh")
        void testGetAllWarehouses_MiddlePageCustomSize() {
            // Arrange
            List<Warehouse> warehouses = List.of(warehouse);
            Page<Warehouse> warehousePage = new PageImpl<>(warehouses);

            when(warehouseRepository.findAll(any(Pageable.class))).thenReturn(warehousePage);

            // Act
            Page<Warehouse> result = warehouseService.getAllWarehouses(1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getContent().size());
            verify(warehouseRepository).findAll(PageRequest.of(1, 5));
        }

        @Test
        @DisplayName("Lấy tất cả kho khi tổng số ít hơn kích thước trang")
        void testGetAllWarehouses_TotalLessThanPageSize() {
            // Arrange
            List<Warehouse> warehouses = List.of(warehouse);
            Page<Warehouse> warehousePage = new PageImpl<>(warehouses);

            when(warehouseRepository.findAll(any(Pageable.class))).thenReturn(warehousePage);

            // Act
            Page<Warehouse> result = warehouseService.getAllWarehouses(0, 20);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getContent().size());
            verify(warehouseRepository).findAll(PageRequest.of(0, 20));
        }

        @Test
        @DisplayName("Lấy danh sách với số trang âm")
        void testGetAllWarehouses_NegativePage() {
            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> {
                warehouseService.getAllWarehouses(-1, 10);
            });
        }

        @Test
        @DisplayName("Lấy danh sách với kích thước trang âm")
        void testGetAllWarehouses_NegativeSize() {
            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> {
                warehouseService.getAllWarehouses(0, -1);
            });
        }

        @Test
        @DisplayName("Lấy danh sách với page=0, size=1")
        void testGetAllWarehouses_MinimumValues() {
            // Arrange
            List<Warehouse> warehouses = List.of(warehouse);
            Page<Warehouse> warehousePage = new PageImpl<>(warehouses);

            when(warehouseRepository.findAll(any(Pageable.class))).thenReturn(warehousePage);

            // Act
            Page<Warehouse> result = warehouseService.getAllWarehouses(0, 1);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getContent().size());
            verify(warehouseRepository).findAll(PageRequest.of(0, 1));
        }

        @Test
        @DisplayName("Lấy danh sách với số trang lớn (vượt quá dữ liệu có sẵn)")
        void testGetAllWarehouses_LargePage() {
            // Arrange
            Page<Warehouse> emptyPage = new PageImpl<>(new ArrayList<>());
            when(warehouseRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

            // Act
            Page<Warehouse> result = warehouseService.getAllWarehouses(1000, 10);

            // Assert
            assertNotNull(result);
            assertTrue(result.getContent().isEmpty());
            verify(warehouseRepository).findAll(PageRequest.of(1000, 10));
        }

        @Test
        @DisplayName("Lấy danh sách khi cơ sở dữ liệu trống")
        void testGetAllWarehouses_EmptyDatabase() {
            // Arrange
            Page<Warehouse> emptyPage = new PageImpl<>(new ArrayList<>());
            when(warehouseRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

            // Act
            Page<Warehouse> result = warehouseService.getAllWarehouses(0, 10);

            // Assert
            assertNotNull(result);
            assertTrue(result.getContent().isEmpty());
            verify(warehouseRepository).findAll(PageRequest.of(0, 10));
        }
    }

    @Nested
    @DisplayName("getWarehouseById Tests")
    class GetWarehouseByIdTests {

        @Test
        @DisplayName("Lấy kho bằng ID tồn tại")
        void testGetWarehouseById_ExistingId() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(warehouse));

            // Act
            Warehouse result = warehouseService.getWarehouseById(1L);

            // Assert
            assertNotNull(result);
            assertEquals(warehouse.getWarehouseId(), result.getWarehouseId());
            verify(warehouseRepository).findById(1L);
        }

        @Test
        @DisplayName("Lấy kho bằng ID không tồn tại (nên ném RuntimeException)")
        void testGetWarehouseById_NonExistentId() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                warehouseService.getWarehouseById(999L);
            });

            assertEquals("Không tìm thấy kho với ID được cung cấp", exception.getMessage());
            verify(warehouseRepository).findById(999L);
        }

        @Test
        @DisplayName("Lấy kho bằng ID null")
        void testGetWarehouseById_NullId() {
            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.getWarehouseById(null);
            });
        }

        @Test
        @DisplayName("Lấy kho bằng ID rất lớn")
        void testGetWarehouseById_VeryLargeId() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> {
                warehouseService.getWarehouseById(Long.MAX_VALUE);
            });

            verify(warehouseRepository).findById(Long.MAX_VALUE);
        }
    }

    @Nested
    @DisplayName("updateWarehouse Tests")
    class UpdateWarehouseTests {

        @Test
        @DisplayName("Cập nhật tất cả các trường thành công")
        void testUpdateWarehouse_AllFields() {
            // Arrange
            WarehouseDTO updateDTO = WarehouseDTO.builder()
                    .warehouseCode("WH002")
                    .warehouseName("Kho Hàng 2")
                    .warehouseDescription("Mô tả kho hàng 2 cập nhật")
                    .status(CommonStatus.ACTIVE)
                    .build();

            Warehouse existingWarehouse = new Warehouse();
            existingWarehouse.setWarehouseId(1L);
            existingWarehouse.setWarehouseCode("WH001");
            existingWarehouse.setWarehouseName("Kho Hàng 1");
            existingWarehouse.setWarehouseDescription("Mô tả kho hàng 1");
            existingWarehouse.setIsActive(true);

            Warehouse updatedWarehouse = new Warehouse();
            updatedWarehouse.setWarehouseId(1L);
            updatedWarehouse.setWarehouseCode("WH002");
            updatedWarehouse.setWarehouseName("Kho Hàng 2");
            updatedWarehouse.setWarehouseDescription("Mô tả kho hàng 2 cập nhật");
            updatedWarehouse.setIsActive(true);

            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(existingWarehouse));
            doNothing().when(warehouseMapper).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(updatedWarehouse);

            // Act
            Warehouse result = warehouseService.updateWarehouse(1L, updateDTO);

            // Assert
            assertNotNull(result);
            assertEquals(updatedWarehouse.getWarehouseCode(), result.getWarehouseCode());
            assertEquals(updatedWarehouse.getWarehouseName(), result.getWarehouseName());
            assertEquals(updatedWarehouse.getWarehouseDescription(), result.getWarehouseDescription());
            verify(warehouseRepository).findById(1L);
            verify(warehouseMapper).updateEntityFromDto(updateDTO, existingWarehouse);
            verify(warehouseRepository).save(existingWarehouse);
        }

        @Test
        @DisplayName("Cập nhật một số trường")
        void testUpdateWarehouse_PartialFields() {
            // Arrange
            WarehouseDTO partialUpdateDTO = WarehouseDTO.builder()
                    .warehouseDescription("Chỉ cập nhật mô tả")
                    .build();

            Warehouse existingWarehouse = new Warehouse();
            existingWarehouse.setWarehouseId(1L);
            existingWarehouse.setWarehouseCode("WH001");
            existingWarehouse.setWarehouseName("Kho Hàng 1");
            existingWarehouse.setWarehouseDescription("Mô tả kho hàng 1");
            existingWarehouse.setIsActive(true);

            Warehouse updatedWarehouse = new Warehouse();
            updatedWarehouse.setWarehouseId(1L);
            updatedWarehouse.setWarehouseCode("WH001");
            updatedWarehouse.setWarehouseName("Kho Hàng 1");
            updatedWarehouse.setWarehouseDescription("Chỉ cập nhật mô tả");
            updatedWarehouse.setIsActive(true);

            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(existingWarehouse));
            doNothing().when(warehouseMapper).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(updatedWarehouse);

            // Act
            Warehouse result = warehouseService.updateWarehouse(1L, partialUpdateDTO);

            // Assert
            assertNotNull(result);
            assertEquals(updatedWarehouse.getWarehouseDescription(), result.getWarehouseDescription());
            verify(warehouseRepository).findById(1L);
            verify(warehouseMapper).updateEntityFromDto(partialUpdateDTO, existingWarehouse);
            verify(warehouseRepository).save(existingWarehouse);
        }

        @Test
        @DisplayName("Cập nhật kho không tồn tại (nên ném RuntimeException)")
        void testUpdateWarehouse_NonExistentWarehouse() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> {
                warehouseService.updateWarehouse(999L, warehouseDTO);
            });

            verify(warehouseRepository).findById(999L);
            verify(warehouseMapper, never()).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Cập nhật với DTO null")
        void testUpdateWarehouse_NullDTO() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(warehouse));

            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.updateWarehouse(1L, null);
            });

            verify(warehouseRepository).findById(1L);
            verify(warehouseMapper, never()).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Cập nhật với ID null")
        void testUpdateWarehouse_NullId() {
            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.updateWarehouse(null, warehouseDTO);
            });

            verify(warehouseRepository, never()).findById(anyLong());
            verify(warehouseMapper, never()).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Cập nhật không có thay đổi")
        void testUpdateWarehouse_NoChanges() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(warehouse));
            doNothing().when(warehouseMapper).updateEntityFromDto(any(WarehouseDTO.class), any(Warehouse.class));
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

            // Act
            Warehouse result = warehouseService.updateWarehouse(1L, warehouseDTO);

            // Assert
            assertNotNull(result);
            assertEquals(warehouse.getWarehouseId(), result.getWarehouseId());
            verify(warehouseRepository).findById(1L);
            verify(warehouseMapper).updateEntityFromDto(warehouseDTO, warehouse);
            verify(warehouseRepository).save(warehouse);
        }
    }

    @Nested
    @DisplayName("deleteWarehouse Tests")
    class DeleteWarehouseTests {

        @Test
        @DisplayName("Xóa kho thành công")
        void testDeleteWarehouse_Success() {
            // Arrange
            doNothing().when(warehouseRepository).deleteById(anyLong());

            // Act
            warehouseService.deleteWarehouse(1L);

            // Assert
            verify(warehouseRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Xóa kho không tồn tại")
        void testDeleteWarehouse_NonExistentWarehouse() {
            // Arrange
            doThrow(new RuntimeException("Không tìm thấy kho")).when(warehouseRepository).deleteById(anyLong());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> {
                warehouseService.deleteWarehouse(999L);
            });

            verify(warehouseRepository).deleteById(999L);
        }

        @Test
        @DisplayName("Xóa kho với ID null")
        void testDeleteWarehouse_NullId() {
            // Act & Assert
            assertThrows(IllegalArgumentException.class, () -> {
                warehouseService.deleteWarehouse(null);
            });

            verify(warehouseRepository, never()).deleteById(any());
        }
        @Test
        @DisplayName("Xóa kho với ID rất lớn")
        void testDeleteWarehouse_VeryLargeId() {
            // Arrange
            doThrow(new RuntimeException("Không tìm thấy kho")).when(warehouseRepository).deleteById(Long.MAX_VALUE);

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                warehouseService.deleteWarehouse(Long.MAX_VALUE);
            });

            assertEquals("Không tìm thấy kho", exception.getMessage());
            verify(warehouseRepository).deleteById(Long.MAX_VALUE);
        }
    }

    @Nested
    @DisplayName("updateWarehouseStatus Tests")
    class UpdateWarehouseStatusTests {

        @Test
        @DisplayName("Thay đổi trạng thái từ active thành inactive")
        void testUpdateWarehouseStatus_ActiveToInactive() {
            // Arrange
            Warehouse activeWarehouse = new Warehouse();
            activeWarehouse.setWarehouseId(1L);
            activeWarehouse.setIsActive(true);

            Warehouse inactiveWarehouse = new Warehouse();
            inactiveWarehouse.setWarehouseId(1L);
            inactiveWarehouse.setIsActive(false);

            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(activeWarehouse));
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(inactiveWarehouse);

            // Act
            Warehouse result = warehouseService.updateWarehouseStatus(1L, false);

            // Assert
            assertNotNull(result);
            assertFalse(result.getIsActive());
            verify(warehouseRepository).findById(1L);
            verify(warehouseRepository).save(activeWarehouse);
        }

        @Test
        @DisplayName("Thay đổi trạng thái từ inactive thành active")
        void testUpdateWarehouseStatus_InactiveToActive() {
            // Arrange
            Warehouse inactiveWarehouse = new Warehouse();
            inactiveWarehouse.setWarehouseId(1L);
            inactiveWarehouse.setIsActive(false);

            Warehouse activeWarehouse = new Warehouse();
            activeWarehouse.setWarehouseId(1L);
            activeWarehouse.setIsActive(true);

            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(inactiveWarehouse));
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(activeWarehouse);

            // Act
            Warehouse result = warehouseService.updateWarehouseStatus(1L, true);

            // Assert
            assertNotNull(result);
            assertTrue(result.getIsActive());
            verify(warehouseRepository).findById(1L);
            verify(warehouseRepository).save(inactiveWarehouse);
        }

        @Test
        @DisplayName("Cập nhật trạng thái kho không tồn tại (nên ném RuntimeException)")
        void testUpdateWarehouseStatus_NonExistentWarehouse() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(RuntimeException.class, () -> {
                warehouseService.updateWarehouseStatus(999L, true);
            });

            verify(warehouseRepository).findById(999L);
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Cập nhật trạng thái với ID null")
        void testUpdateWarehouseStatus_NullId() {
            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.updateWarehouseStatus(null, true);
            });

            verify(warehouseRepository, never()).findById(any());
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Cập nhật trạng thái với giá trị null")
        void testUpdateWarehouseStatus_NullStatus() {
            // Arrange
            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(warehouse));

            // Act & Assert
            assertThrows(NullPointerException.class, () -> {
                warehouseService.updateWarehouseStatus(1L, null);
            });

            verify(warehouseRepository).findById(1L);
            verify(warehouseRepository, never()).save(any(Warehouse.class));
        }

        @Test
        @DisplayName("Cập nhật trạng thái với cùng giá trị (không thay đổi)")
        void testUpdateWarehouseStatus_SameValue() {
            // Arrange
            Warehouse activeWarehouse = new Warehouse();
            activeWarehouse.setWarehouseId(1L);
            activeWarehouse.setIsActive(true);

            when(warehouseRepository.findById(anyLong())).thenReturn(Optional.of(activeWarehouse));
            when(warehouseRepository.save(any(Warehouse.class))).thenReturn(activeWarehouse);

            // Act
            Warehouse result = warehouseService.updateWarehouseStatus(1L, true);

            // Assert
            assertNotNull(result);
            assertTrue(result.getIsActive());
            verify(warehouseRepository).findById(1L);
            verify(warehouseRepository).save(activeWarehouse);
        }
    }
}