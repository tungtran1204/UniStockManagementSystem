package vn.unistock.unistockmanagementsystem.features.user.materialType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.unistock.unistockmanagementsystem.entities.MaterialType;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MaterialTypeServiceTest {

    @Mock
    private MaterialTypeRepository materialTypeRepository;

    @InjectMocks
    private MaterialTypeService materialTypeService;

    private MaterialType materialType1;
    private MaterialType materialType2;

    @BeforeEach
    void setUp() {
        materialType1 = new MaterialType();
        materialType1.setMaterialTypeId(1L);
        materialType1.setName("Type 1");
        materialType1.setDescription("Description 1");
        materialType1.setUsing(true);

        materialType2 = new MaterialType();
        materialType2.setMaterialTypeId(2L);
        materialType2.setName("Type 2");
        materialType2.setDescription("Description 2");
        materialType2.setUsing(false);
    }

    @Test
    @DisplayName("Should return all material types")
    void getAllMaterialTypes() {
        // Arrange
        List<MaterialType> materialTypes = Arrays.asList(materialType1, materialType2);
        when(materialTypeRepository.findAll()).thenReturn(materialTypes);

        // Act
        List<MaterialTypeDTO> result = materialTypeService.getAllMaterialTypes();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Type 1", result.get(0).getName());
        assertEquals("Type 2", result.get(1).getName());
        verify(materialTypeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no material types exist")
    void getAllMaterialTypes_EmptyList() {
        // Arrange
        when(materialTypeRepository.findAll()).thenReturn(List.of());

        // Act
        List<MaterialTypeDTO> result = materialTypeService.getAllMaterialTypes();

        // Assert
        assertTrue(result.isEmpty());
        verify(materialTypeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return material type by ID")
    void getMaterialTypeById() {
        // Arrange
        when(materialTypeRepository.findById(1L)).thenReturn(Optional.of(materialType1));

        // Act
        MaterialTypeDTO result = materialTypeService.getMaterialTypeById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getMaterialTypeId());
        assertEquals("Type 1", result.getName());
        assertEquals("Description 1", result.getDescription());
        assertTrue(result.isUsing());
        verify(materialTypeRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when material type not found by ID")
    void getMaterialTypeById_NotFound() {
        // Arrange
        Long id = 999L;
        when(materialTypeRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> materialTypeService.getMaterialTypeById(id)
        );

        assertEquals("Không tìm thấy loại nguyên liệu với ID: " + id, exception.getMessage());
        verify(materialTypeRepository, times(1)).findById(id);
    }

    @Test
    @DisplayName("Should create new material type")
    void createMaterialType() {
        // Arrange
        String createdBy = "1";
        MaterialTypeDTO inputDTO = new MaterialTypeDTO();
        inputDTO.setName("New Type");
        inputDTO.setDescription("New Description");
        inputDTO.setUsing(true);

        // Set up the repository to return the entity with ID after saving
        when(materialTypeRepository.save(any(MaterialType.class))).thenAnswer(invocation -> {
            MaterialType savedEntity = invocation.getArgument(0);
            savedEntity.setMaterialTypeId(3L); // Simulate DB setting ID
            return savedEntity;
        });

        // Act
        MaterialTypeDTO result = materialTypeService.createMaterialType(inputDTO, createdBy);

        // Assert
        assertNotNull(result);
        assertEquals(3L, result.getMaterialTypeId());
        assertEquals("New Type", result.getName());
        assertEquals("New Description", result.getDescription());
        assertTrue(result.isUsing());

        // Verify repository interaction and entity setup
        verify(materialTypeRepository, times(1)).save(argThat(entity -> {
            assertEquals("New Type", entity.getName());
            assertEquals("New Description", entity.getDescription());
            assertTrue(entity.isUsing());
            assertEquals(1L, entity.getCreatedBy());
            assertNotNull(entity.getCreatedAt());
            return true;
        }));
    }

    @Test
    @DisplayName("Should update material type")
    void updateMaterialType() {
        // Arrange
        Long id = 1L;
        MaterialTypeDTO updateDTO = new MaterialTypeDTO();
        updateDTO.setName("Updated Name");
        updateDTO.setDescription("Updated Description");
        updateDTO.setUsing(false);

        when(materialTypeRepository.findById(id)).thenReturn(Optional.of(materialType1));
        when(materialTypeRepository.save(any(MaterialType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        MaterialTypeDTO result = materialTypeService.updateMaterialType(id, updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getMaterialTypeId());
        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Description", result.getDescription());
        assertFalse(result.isUsing());

        verify(materialTypeRepository, times(1)).findById(id);
        verify(materialTypeRepository, times(1)).save(argThat(entity -> {
            assertEquals("Updated Name", entity.getName());
            assertEquals("Updated Description", entity.getDescription());
            assertFalse(entity.isUsing());
            assertNotNull(entity.getUpdatedAt());
            return true;
        }));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent material type")
    void updateMaterialType_NotFound() {
        // Arrange
        Long id = 999L;
        MaterialTypeDTO updateDTO = new MaterialTypeDTO();
        updateDTO.setName("Updated Name");

        when(materialTypeRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> materialTypeService.updateMaterialType(id, updateDTO)
        );

        assertEquals("Không tìm thấy loại nguyên liệu", exception.getMessage());
        verify(materialTypeRepository, times(1)).findById(id);
        verify(materialTypeRepository, never()).save(any(MaterialType.class));
    }

    @Test
    @DisplayName("Should toggle material type status from active to inactive")
    void toggleStatus_ActiveToInactive() {
        // Arrange
        Long id = 1L;
        MaterialType activeType = new MaterialType();
        activeType.setMaterialTypeId(id);
        activeType.setName("Type 1");
        activeType.setUsing(true);

        when(materialTypeRepository.findById(id)).thenReturn(Optional.of(activeType));
        when(materialTypeRepository.save(any(MaterialType.class))).thenAnswer(invocation -> {
            MaterialType savedEntity = invocation.getArgument(0);
            // The status should be toggled in the saved entity
            assertFalse(savedEntity.isUsing());
            return savedEntity;
        });

        // Act
        MaterialTypeDTO result = materialTypeService.toggleStatus(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getMaterialTypeId());
        assertEquals("Type 1", result.getName());
        assertFalse(result.isUsing());

        verify(materialTypeRepository, times(1)).findById(id);
        verify(materialTypeRepository, times(1)).save(any(MaterialType.class));
    }

    @Test
    @DisplayName("Should toggle material type status from inactive to active")
    void toggleStatus_InactiveToActive() {
        // Arrange
        Long id = 2L;
        MaterialType inactiveType = new MaterialType();
        inactiveType.setMaterialTypeId(id);
        inactiveType.setName("Type 2");
        inactiveType.setUsing(false);

        when(materialTypeRepository.findById(id)).thenReturn(Optional.of(inactiveType));
        when(materialTypeRepository.save(any(MaterialType.class))).thenAnswer(invocation -> {
            MaterialType savedEntity = invocation.getArgument(0);
            // The status should be toggled in the saved entity
            assertTrue(savedEntity.isUsing());
            return savedEntity;
        });

        // Act
        MaterialTypeDTO result = materialTypeService.toggleStatus(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getMaterialTypeId());
        assertEquals("Type 2", result.getName());
        assertTrue(result.isUsing());

        verify(materialTypeRepository, times(1)).findById(id);
        verify(materialTypeRepository, times(1)).save(any(MaterialType.class));
    }

    @Test
    @DisplayName("Should throw exception when toggling status of non-existent material type")
    void toggleStatus_NotFound() {
        // Arrange
        Long id = 999L;
        when(materialTypeRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> materialTypeService.toggleStatus(id)
        );

        assertEquals("Không tìm thấy loại nguyên liệu", exception.getMessage());
        verify(materialTypeRepository, times(1)).findById(id);
        verify(materialTypeRepository, never()).save(any(MaterialType.class));
    }

    @Test
    @DisplayName("Should return all material types")
    void returnAllMaterialTypes() {
        // Arrange
        List<MaterialType> materialTypes = Arrays.asList(materialType1, materialType2);
        when(materialTypeRepository.findAll()).thenReturn(materialTypes);

        // Act
        List<MaterialTypeDTO> result = materialTypeService.getAllMaterialTypes();

        // Assert
        assertEquals(2, result.size());
        verify(materialTypeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should update material type status when toggling")
    void updateMaterialTypeStatus() {
        // Arrange
        Long id = 1L;
        when(materialTypeRepository.findById(id)).thenReturn(Optional.of(materialType1));
        when(materialTypeRepository.save(any())).thenReturn(materialType1);

        // Act
        MaterialTypeDTO result = materialTypeService.toggleStatus(id);

        // Assert
        assertNotNull(result);
        verify(materialTypeRepository).findById(id);
        verify(materialTypeRepository).save(any());
    }
}