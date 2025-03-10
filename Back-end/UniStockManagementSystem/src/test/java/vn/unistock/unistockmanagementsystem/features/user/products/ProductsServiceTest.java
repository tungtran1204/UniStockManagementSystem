package vn.unistock.unistockmanagementsystem.features.user.products;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.ProductType;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductsServiceTest {

    @Mock
    private ProductsRepository productsRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private ProductTypeRepository productTypeRepository;

    @Mock
    private AzureBlobService azureBlobService;

    @InjectMocks
    private ProductsService productsService;

    @Captor
    private ArgumentCaptor<Product> productCaptor;

    @Test
    @DisplayName("Should return paginated products")
    void getAllProducts_ReturnsPaginatedProducts() {
        // Given
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);

        Product product1 = createSampleProduct(1L, "P001", "Product 1");
        Product product2 = createSampleProduct(2L, "P002", "Product 2");
        List<Product> productList = Arrays.asList(product1, product2);
        Page<Product> productPage = new PageImpl<>(productList, pageable, productList.size());

        when(productsRepository.findAll(pageable)).thenReturn(productPage);

        // When
        Page<ProductsDTO> result = productsService.getAllProducts(page, size);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        assertEquals("Product 1", result.getContent().get(0).getProductName());
        assertEquals("Product 2", result.getContent().get(1).getProductName());
    }

    @Test
    @DisplayName("Should create a new product")
    void createProduct_CreatesNewProduct() throws IOException {
        // Given
        ProductsDTO productDTO = new ProductsDTO();
        productDTO.setProductCode("P001");
        productDTO.setProductName("New Product");
        productDTO.setDescription("Description");
        productDTO.setUnitId(1L);
        productDTO.setTypeId(1L);
        productDTO.setImageUrl("image-url.jpg");
        productDTO.setIsProductionActive(true);

        Unit unit = new Unit();
        unit.setUnitId(1L);
        unit.setUnitName("Piece");

        ProductType productType = new ProductType();
        productType.setTypeId(1L);
        productType.setTypeName("Electronic");

        when(unitRepository.findById(1L)).thenReturn(Optional.of(unit));
        when(productTypeRepository.findById(1L)).thenReturn(Optional.of(productType));
        when(productsRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product savedProduct = invocation.getArgument(0);
            savedProduct.setProductId(1L);
            return savedProduct;
        });

        // When
        Product result = productsService.createProduct(productDTO, "Admin");

        // Then
        verify(productsRepository).save(productCaptor.capture());
        Product capturedProduct = productCaptor.getValue();

        assertNotNull(result);
        assertEquals(1L, result.getProductId());
        assertEquals("P001", capturedProduct.getProductCode());
        assertEquals("New Product", capturedProduct.getProductName());
        assertEquals("Description", capturedProduct.getDescription());
        assertEquals(unit, capturedProduct.getUnit());
        assertEquals(productType, capturedProduct.getProductType());
        assertEquals("image-url.jpg", capturedProduct.getImageUrl());
        assertEquals(true, capturedProduct.getIsProductionActive());
        assertEquals("Admin", capturedProduct.getCreatedBy());
        assertNotNull(capturedProduct.getCreatedAt());
    }

    @Test
    @DisplayName("Should create product with default production status when not provided")
    void createProduct_WithDefaultProductionStatus() throws IOException {
        // Given
        ProductsDTO productDTO = new ProductsDTO();
        productDTO.setProductCode("P001");
        productDTO.setProductName("New Product");
        productDTO.setIsProductionActive(null); // Not provided

        when(productsRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product savedProduct = invocation.getArgument(0);
            savedProduct.setProductId(1L);
            return savedProduct;
        });

        // When
        Product result = productsService.createProduct(productDTO, "Admin");

        // Then
        verify(productsRepository).save(productCaptor.capture());
        Product capturedProduct = productCaptor.getValue();

        assertTrue(capturedProduct.getIsProductionActive()); // Default value should be true
    }

    @Test
    @DisplayName("Should get product by ID")
    void getProductById_ReturnsProduct() {
        // Given
        Long productId = 1L;
        Product product = createSampleProduct(productId, "P001", "Product 1");

        when(productsRepository.findById(productId)).thenReturn(Optional.of(product));

        // When
        ProductsDTO result = productsService.getProductById(productId);

        // Then
        assertNotNull(result);
        assertEquals(productId, result.getProductId());
        assertEquals("P001", result.getProductCode());
        assertEquals("Product 1", result.getProductName());
        assertEquals("Test Unit", result.getUnitName());
        assertEquals("Test Type", result.getTypeName());
    }

    @Test
    @DisplayName("Should throw exception when product not found by ID")
    void getProductById_ProductNotFound_ThrowsException() {
        // Given
        Long productId = 1L;
        when(productsRepository.findById(productId)).thenReturn(Optional.empty());

        // When, Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            productsService.getProductById(productId);
        });

        assertEquals("Không tìm thấy sản phẩm với ID: " + productId, exception.getMessage());
    }

    @Test
    @DisplayName("Should toggle production status")
    void toggleProductionStatus_Success() {
        // Given
        Long productId = 1L;
        Product product = createSampleProduct(productId, "P001", "Product 1");
        product.setIsProductionActive(true); // Initially active

        when(productsRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productsRepository.save(any(Product.class))).thenReturn(product);

        // When
        ProductsDTO result = productsService.toggleProductionStatus(productId);

        // Then
        verify(productsRepository).save(productCaptor.capture());
        Product capturedProduct = productCaptor.getValue();

        assertFalse(capturedProduct.getIsProductionActive()); // Should be toggled to false
        assertNotNull(result);
    }

    @Test
    @DisplayName("Should throw exception when toggling non-existent product")
    void toggleProductionStatus_ProductNotFound_ThrowsException() {
        // Given
        Long productId = 1L;
        when(productsRepository.findById(productId)).thenReturn(Optional.empty());

        // When, Then
        Exception exception = assertThrows(RuntimeException.class, () -> {
            productsService.toggleProductionStatus(productId);
        });

        assertEquals("Không tìm thấy sản phẩm", exception.getMessage());
        verify(productsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should check if product code exists")
    void isProductCodeExists_ReturnsCorrectly() {
        // Given
        String productCode = "P001";
        Long excludeId = 2L;

        when(productsRepository.existsByProductCode(productCode)).thenReturn(true);
        when(productsRepository.existsByProductCodeAndProductIdNot(productCode, excludeId)).thenReturn(false);

        // When
        boolean existsWithoutExclude = productsService.isProductCodeExists(productCode, null);
        boolean existsWithExclude = productsService.isProductCodeExists(productCode, excludeId);

        // Then
        assertTrue(existsWithoutExclude);
        assertFalse(existsWithExclude);
    }

    @Test
    @DisplayName("Should update product without new image")
    void updateProduct_WithoutNewImage_Success() throws IOException {
        // Given
        Long productId = 1L;
        Product existingProduct = createSampleProduct(productId, "P001", "Old Product");
        existingProduct.setImageUrl("old-image.jpg");

        ProductsDTO updatedDTO = new ProductsDTO();
        updatedDTO.setProductCode("P001-Updated");
        updatedDTO.setProductName("Updated Product");
        updatedDTO.setDescription("Updated Description");
        updatedDTO.setUnitId(2L);
        updatedDTO.setTypeId(2L);

        Unit newUnit = new Unit();
        newUnit.setUnitId(2L);
        newUnit.setUnitName("New Unit");

        ProductType newType = new ProductType();
        newType.setTypeId(2L);
        newType.setTypeName("New Type");

        when(productsRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
        when(unitRepository.findById(2L)).thenReturn(Optional.of(newUnit));
        when(productTypeRepository.findById(2L)).thenReturn(Optional.of(newType));
        when(productsRepository.save(any(Product.class))).thenReturn(existingProduct);

        // When
        ProductsDTO result = productsService.updateProduct(productId, updatedDTO, null);

        // Then
        verify(productsRepository).save(productCaptor.capture());
        Product capturedProduct = productCaptor.getValue();

        assertEquals("P001-Updated", capturedProduct.getProductCode());
        assertEquals("Updated Product", capturedProduct.getProductName());
        assertEquals("Updated Description", capturedProduct.getDescription());
        assertEquals(newUnit, capturedProduct.getUnit());
        assertEquals(newType, capturedProduct.getProductType());
        assertEquals("old-image.jpg", capturedProduct.getImageUrl()); // Image URL should remain the same

        verify(azureBlobService, never()).deleteFile(anyString());
        verify(azureBlobService, never()).uploadFile(any(MultipartFile.class));
    }

    @Test
    @DisplayName("Should update product with new image")
    void updateProduct_WithNewImage_Success() throws IOException {
        // Given
        Long productId = 1L;
        Product existingProduct = createSampleProduct(productId, "P001", "Old Product");
        existingProduct.setImageUrl("old-image.jpg");

        ProductsDTO updatedDTO = new ProductsDTO();
        updatedDTO.setProductCode("P001-Updated");
        updatedDTO.setProductName("Updated Product");

        MockMultipartFile newImage = new MockMultipartFile(
                "image", "new-image.jpg", "image/jpeg", "test image content".getBytes());

        when(productsRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
        when(azureBlobService.uploadFile(newImage)).thenReturn("new-image.jpg");
        when(productsRepository.save(any(Product.class))).thenReturn(existingProduct);

        // When
        ProductsDTO result = productsService.updateProduct(productId, updatedDTO, newImage);

        // Then
        verify(azureBlobService).deleteFile("old-image.jpg");
        verify(azureBlobService).uploadFile(newImage);
        verify(productsRepository).save(productCaptor.capture());

        Product capturedProduct = productCaptor.getValue();
        assertEquals("new-image.jpg", capturedProduct.getImageUrl());
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent product")
    void updateProduct_ProductNotFound_ThrowsException() throws IOException {
        // Given
        Long productId = 1L;
        ProductsDTO updatedDTO = new ProductsDTO();

        when(productsRepository.findById(productId)).thenReturn(Optional.empty());

        // When, Then
        Exception exception = assertThrows(RuntimeException.class, () -> {
            productsService.updateProduct(productId, updatedDTO, null);
        });

        assertEquals("Không tìm thấy sản phẩm", exception.getMessage());
        verify(productsRepository, never()).save(any());
    }

    private Product createSampleProduct(Long id, String code, String name) {
        Product product = new Product();
        product.setProductId(id);
        product.setProductCode(code);
        product.setProductName(name);
        product.setDescription("Sample Description");
        product.setIsProductionActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setCreatedBy("Admin");

        Unit unit = new Unit();
        unit.setUnitId(1L);
        unit.setUnitName("Test Unit");
        product.setUnit(unit);

        ProductType type = new ProductType();
        type.setTypeId(1L);
        type.setTypeName("Test Type");
        product.setProductType(type);

        return product;
    }
}