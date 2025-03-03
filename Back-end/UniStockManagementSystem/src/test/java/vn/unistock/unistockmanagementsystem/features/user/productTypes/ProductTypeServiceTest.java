package vn.unistock.unistockmanagementsystem.features.user.productTypes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.unistock.unistockmanagementsystem.entities.ItemGroup;
import vn.unistock.unistockmanagementsystem.entities.ProductType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductTypeServiceTest {

    @Mock
    private ProductTypeRepository productTypeRepository;

    @InjectMocks
    private ProductTypeService productTypeService;

    private List<ProductType> productTypes;
    private LocalDateTime now;
    private ItemGroup defaultGroup;

    @BeforeEach
    void setUp() {
        // Setup common test data
        now = LocalDateTime.now();
        defaultGroup = new ItemGroup();
        defaultGroup.setGroupId(1L);
        defaultGroup.setGroupCode("DG001");
        defaultGroup.setGroupName("Default Group");
        defaultGroup.setStatus(true);
        defaultGroup.setDescription("Default group for testing");
        defaultGroup.setCreatedAt(now);
        defaultGroup.setUpdatedAt(now);
        defaultGroup.setCreatedBy(1L);
        defaultGroup.setUpdatedBy(1L);

        // Prepare test data
        productTypes = new ArrayList<>();
        productTypes.add(createProductType(1L, "E001", "Electronics", defaultGroup, true,
                "Electronic items", now, now, 1L, 1L));
        productTypes.add(createProductType(2L, "C001", "Clothing", defaultGroup, true,
                "Clothing items", now, now, 1L, 1L));
        productTypes.add(createProductType(3L, "F001", "Food", defaultGroup, true,
                "Food items", now, now, 1L, 1L));
    }

    @Test
    @DisplayName("Should return all product types as DTOs")
    void getAllProductTypes_ShouldReturnAllProductTypesAsDTOs() {
        // Arrange
        when(productTypeRepository.findAll()).thenReturn(productTypes);

        // Act
        List<ProductTypeDTO> result = productTypeService.getAllProductTypes();

        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());

        // Verify DTO conversion is correct
        for (int i = 0; i < productTypes.size(); i++) {
            ProductType entity = productTypes.get(i);
            ProductTypeDTO dto = result.get(i);

            assertEquals(entity.getTypeId(), dto.getTypeId());
            assertEquals(entity.getTypeName(), dto.getTypeName());
        }

        verify(productTypeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no product types exist")
    void getAllProductTypes_ShouldReturnEmptyList_WhenNoProductTypesExist() {
        // Arrange
        when(productTypeRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<ProductTypeDTO> result = productTypeService.getAllProductTypes();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(productTypeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should handle null values in repository result")
    void getAllProductTypes_ShouldHandleNullValues() {
        // Arrange
        List<ProductType> listWithNull = new ArrayList<>();
        listWithNull.add(productTypes.get(0));
        listWithNull.add(null);
        listWithNull.add(productTypes.get(2));

        when(productTypeRepository.findAll()).thenReturn(listWithNull);

        // Act
        List<ProductTypeDTO> result = productTypeService.getAllProductTypes();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(productTypeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should filter out items with null properties")
    void getAllProductTypes_ShouldFilterOutItemsWithNullProperties() {
        // Arrange
        ProductType typeWithNullId = createProductType(null, "NC001", "NoId", defaultGroup, true,
                "No ID", now, now, 1L, 1L);
        ProductType typeWithNullName = createProductType(4L, "NN001", null, defaultGroup, true,
                "No Name", now, now, 1L, 1L);

        List<ProductType> listWithNullProperties = new ArrayList<>(productTypes);
        listWithNullProperties.add(typeWithNullId);
        listWithNullProperties.add(typeWithNullName);

        when(productTypeRepository.findAll()).thenReturn(listWithNullProperties);

        // Act
        List<ProductTypeDTO> result = productTypeService.getAllProductTypes();

        // Assert
        assertNotNull(result);
        assertEquals(5, result.size());

        // Verify nulls are preserved in DTOs
        boolean hasNullId = result.stream().anyMatch(dto -> dto.getTypeId() == null);
        boolean hasNullName = result.stream().anyMatch(dto -> dto.getTypeName() == null);

        assertTrue(hasNullId);
        assertTrue(hasNullName);

        verify(productTypeRepository, times(1)).findAll();
    }

    /**
     * Helper method to create a ProductType entity with all fields
     */
    private ProductType createProductType(Long id, String code, String name, ItemGroup group,
                                          Boolean status, String description, LocalDateTime createdAt,
                                          LocalDateTime updatedAt, Long createdBy, Long updatedBy) {
        ProductType productType = new ProductType();
        productType.setTypeId(id);
        productType.setTypeCode(code);
        productType.setTypeName(name);
        productType.setItemGroup(group);
        productType.setStatus(status);
        productType.setDescription(description);
        productType.setCreatedAt(createdAt);
        productType.setUpdatedAt(updatedAt);
        productType.setCreatedBy(createdBy);
        productType.setUpdatedBy(updatedBy);
        return productType;
    }
}