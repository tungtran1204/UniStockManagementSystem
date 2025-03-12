package vn.unistock.unistockmanagementsystem.features.user.products;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.ProductMaterial;
import vn.unistock.unistockmanagementsystem.entities.ProductType;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsDTO;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductsServiceTest {

    @Mock
    private ProductsRepository productsRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private ProductTypeRepository productTypeRepository;

    @Mock
    private MaterialsRepository materialsRepository;

    @Mock
    private ProductMaterialsRepository productMaterialsRepository;

    @Mock
    private AzureBlobService azureBlobService;

    @Spy
    private ProductsMapper productsMapper = ProductsMapper.INSTANCE;

    @InjectMocks
    private ProductsService productsService;

    private ProductsDTO productDTO;
    private Product product;
    private Unit unit;
    private ProductType productType;
    private Material material1, material2;
    private ProductMaterial productMaterial1, productMaterial2;
    private List<ProductMaterialsDTO> materialDTOs;
    private ArrayList<ProductMaterial> productMaterials;
    private MockMultipartFile imageFile;

    @BeforeEach
    void setUp() {
        // Thiết lập dữ liệu test chung
        unit = new Unit();
        unit.setUnitId(1L);
        unit.setUnitName("Cái");

        productType = new ProductType();
        productType.setTypeId(1L);
        productType.setTypeName("Thành phẩm");

        material1 = new Material();
        material1.setMaterialId(1L);
        material1.setMaterialCode("M001");
        material1.setMaterialName("Vật liệu 1");

        material2 = new Material();
        material2.setMaterialId(2L);
        material2.setMaterialCode("M002");
        material2.setMaterialName("Vật liệu 2");

        productDTO = new ProductsDTO();
        productDTO.setProductCode("P001");
        productDTO.setProductName("Sản phẩm Test");
        productDTO.setDescription("Mô tả sản phẩm test");
        productDTO.setUnitId(1L);
        productDTO.setTypeId(1L);
        productDTO.setIsProductionActive(true);

        // Tạo định mức
        ProductMaterialsDTO materialDTO1 = new ProductMaterialsDTO();
        materialDTO1.setMaterialId(1L);
        materialDTO1.setMaterialCode("M001");
        materialDTO1.setMaterialName("Vật liệu 1");
        materialDTO1.setQuantity(10);

        ProductMaterialsDTO materialDTO2 = new ProductMaterialsDTO();
        materialDTO2.setMaterialId(2L);
        materialDTO2.setMaterialCode("M002");
        materialDTO2.setMaterialName("Vật liệu 2");
        materialDTO2.setQuantity(5);

        materialDTOs = Arrays.asList(materialDTO1, materialDTO2);

        // Thiết lập sản phẩm
        product = new Product();
        product.setProductId(1L);
        product.setProductCode("P001");
        product.setProductName("Sản phẩm Test");
        product.setDescription("Mô tả sản phẩm test");
        product.setUnit(unit);
        product.setProductType(productType);
        product.setIsProductionActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setCreatedBy("Admin");

        // Thiết lập product materials
        productMaterial1 = new ProductMaterial();
        productMaterial1.setProduct(product);
        productMaterial1.setMaterial(material1);
        productMaterial1.setQuantity(10);

        productMaterial2 = new ProductMaterial();
        productMaterial2.setProduct(product);
        productMaterial2.setMaterial(material2);
        productMaterial2.setQuantity(5);

        productMaterials = new ArrayList<>();
        productMaterials.add(productMaterial1);
        productMaterials.add(productMaterial2);
        product.setProductMaterials(productMaterials);

        // Thiết lập mock file
        imageFile = new MockMultipartFile(
                "image",
                "test-image.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );
    }

    @Nested
    @DisplayName("Test tạo sản phẩm với định mức")
    class CreateProductWithMaterials {

        @Test
        @DisplayName("Tạo sản phẩm thành công với định mức hợp lệ")
        void createProductWithValidMaterials() throws IOException {
            // Arrange
            productDTO.setMaterials(materialDTOs);
            productDTO.setImage(imageFile);

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(1L)).thenReturn(Optional.of(material1));
            when(materialsRepository.findById(2L)).thenReturn(Optional.of(material2));
            when(azureBlobService.uploadFile(any(MultipartFile.class))).thenReturn("image-url");
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            Product result = productsService.createProduct(productDTO, "Admin");

            // Assert
            assertNotNull(result);
            assertEquals("P001", result.getProductCode());
            verify(productsRepository).save(any(Product.class));
            verify(productMaterialsRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("Tạo sản phẩm thành công không có định mức")
        void createProductWithoutMaterials() throws IOException {
            // Arrange
            productDTO.setMaterials(null);

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            Product result = productsService.createProduct(productDTO, "Admin");

            // Assert
            assertNotNull(result);
            verify(productsRepository).save(any(Product.class));
            verify(productMaterialsRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("Tạo sản phẩm thất bại khi mã sản phẩm đã tồn tại")
        void createProductWithDuplicateCode() {
            // Arrange
            when(productsRepository.existsByProductCode(anyString())).thenReturn(true);

            // Act & Assert
            Exception exception = assertThrows(IllegalArgumentException.class, () -> {
                productsService.createProduct(productDTO, "Admin");
            });
            assertEquals("Mã sản phẩm đã tồn tại!", exception.getMessage());
        }

        @Test
        @DisplayName("Tạo sản phẩm thất bại khi nguyên liệu không tồn tại")
        void createProductWithNonExistentMaterial() {
            // Arrange
            productDTO.setMaterials(materialDTOs);

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(1L)).thenReturn(Optional.of(material1));
            when(materialsRepository.findById(2L)).thenReturn(Optional.empty()); // Material 2 không tồn tại
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act & Assert
            Exception exception = assertThrows(IllegalArgumentException.class, () -> {
                productsService.createProduct(productDTO, "Admin");
            });
            assertEquals("Nguyên vật liệu không tồn tại!", exception.getMessage());
        }

        @Test
        @DisplayName("Tạo sản phẩm thất bại khi đơn vị không tồn tại")
        void createProductWithNonExistentUnit() {
            // Arrange
            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(IllegalArgumentException.class, () -> {
                productsService.createProduct(productDTO, "Admin");
            });
            assertEquals("Đơn vị không tồn tại!", exception.getMessage());
        }

        @Test
        @DisplayName("Tạo sản phẩm với danh sách định mức rỗng")
        void createProductWithEmptyMaterialsList() throws IOException {
            // Arrange
            productDTO.setMaterials(Collections.emptyList());

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            Product result = productsService.createProduct(productDTO, "Admin");

            // Assert
            assertNotNull(result);
            verify(productsRepository).save(any(Product.class));
            verify(productMaterialsRepository, never()).saveAll(anyList());
        }
    }

    @Nested
    @DisplayName("Test cập nhật sản phẩm với định mức")
    class UpdateProductWithMaterials {

        @Test
        @DisplayName("Cập nhật sản phẩm thành công với định mức mới")
        void updateProductWithNewMaterials() throws IOException {
            // Arrange
            Product existingProduct = new Product();
            existingProduct.setProductId(1L);
            existingProduct.setProductCode("P001");
            existingProduct.setProductName("Sản phẩm Test");
            existingProduct.setDescription("Mô tả sản phẩm test");
            existingProduct.setUnit(unit);
            existingProduct.setProductType(productType);
            existingProduct.setIsProductionActive(true);
            existingProduct.setCreatedAt(LocalDateTime.now());
            existingProduct.setCreatedBy("Admin");
            existingProduct.setProductMaterials(new ArrayList<>());

            productDTO.setMaterials(materialDTOs);

            when(productsRepository.findById(anyLong())).thenReturn(Optional.of(existingProduct));
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(1L)).thenReturn(Optional.of(material1));
            when(materialsRepository.findById(2L)).thenReturn(Optional.of(material2));
            when(productsRepository.save(any(Product.class))).thenReturn(existingProduct);

            // Act
            ProductsDTO result = productsService.updateProduct(1L, productDTO, null);

            // Assert
            assertNotNull(result);
            verify(productsRepository).save(any(Product.class));
        }

        @Test
        @DisplayName("Cập nhật sản phẩm thành công với cập nhật định mức hiện có")
        void updateProductWithExistingMaterials() throws IOException {
            // Arrange
            Product existingProduct = new Product();
            existingProduct.setProductId(1L);
            existingProduct.setProductCode("P001");
            existingProduct.setProductName("Sản phẩm Test");
            existingProduct.setIsProductionActive(true);
            existingProduct.setUnit(unit);
            existingProduct.setProductType(productType);
            existingProduct.setProductMaterials(new ArrayList<>(productMaterials));

            // Thay đổi quantity của materialDTO1
            ProductMaterialsDTO updatedMaterialDTO1 = new ProductMaterialsDTO();
            updatedMaterialDTO1.setMaterialId(1L);
            updatedMaterialDTO1.setQuantity(15); // Tăng từ 10 lên 15

            List<ProductMaterialsDTO> updatedMaterialDTOs = new ArrayList<>();
            updatedMaterialDTOs.add(updatedMaterialDTO1);
            updatedMaterialDTOs.add(materialDTOs.get(1));
            productDTO.setMaterials(updatedMaterialDTOs);

            when(productsRepository.findById(anyLong())).thenReturn(Optional.of(existingProduct));
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(productsRepository.save(any(Product.class))).thenReturn(existingProduct);

            // Act
            ProductsDTO result = productsService.updateProduct(1L, productDTO, null);

            // Assert
            assertNotNull(result);
            verify(productsRepository).save(any(Product.class));
        }

        @Test
        @DisplayName("Cập nhật sản phẩm thành công với xóa định mức hiện có")
        void updateProductRemovingExistingMaterials() throws IOException {
            // Arrange
            Product existingProduct = new Product();
            existingProduct.setProductId(1L);
            existingProduct.setProductCode("P001");
            existingProduct.setProductName("Sản phẩm Test");
            existingProduct.setIsProductionActive(true);
            existingProduct.setUnit(unit);
            existingProduct.setProductType(productType);
            existingProduct.setProductMaterials(new ArrayList<>(productMaterials));

            // Tạo danh sách định mức rỗng
            productDTO.setMaterials(Collections.emptyList());

            when(productsRepository.findById(anyLong())).thenReturn(Optional.of(existingProduct));
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(productsRepository.save(any(Product.class))).thenReturn(existingProduct);

            // Act
            ProductsDTO result = productsService.updateProduct(1L, productDTO, null);

            // Assert
            assertNotNull(result);
            verify(productMaterialsRepository).deleteAll(anyList());
            verify(productsRepository).save(any(Product.class));
        }

        @Test
        @DisplayName("Cập nhật sản phẩm với xóa một phần định mức và thêm định mức mới")
        void updateProductWithPartialMaterialsUpdateAndAdd() throws IOException {
            // Arrange
            // Chỉ giữ lại material1 và thêm material3
            ProductMaterialsDTO materialDTO1 = new ProductMaterialsDTO();
            materialDTO1.setMaterialId(1L);
            materialDTO1.setQuantity(12); // Cập nhật số lượng

            ProductMaterialsDTO materialDTO3 = new ProductMaterialsDTO();
            materialDTO3.setMaterialId(3L);
            materialDTO3.setQuantity(8);

            List<ProductMaterialsDTO> updatedMaterials = Arrays.asList(materialDTO1, materialDTO3);
            productDTO.setMaterials(updatedMaterials);

            Material material3 = new Material();
            material3.setMaterialId(3L);
            material3.setMaterialCode("M003");
            material3.setMaterialName("Vật liệu 3");

            when(productsRepository.findById(anyLong())).thenReturn(Optional.of(product));
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(1L)).thenReturn(Optional.of(material1));
            when(materialsRepository.findById(3L)).thenReturn(Optional.of(material3));
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            ProductsDTO result = productsService.updateProduct(1L, productDTO, null);

            // Assert
            assertNotNull(result);
            verify(productsRepository).save(any(Product.class));
        }

        @Test
        @DisplayName("Cập nhật sản phẩm thất bại khi sản phẩm không tồn tại")
        void updateNonExistentProduct() {
            // Arrange
            when(productsRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> {
                productsService.updateProduct(1L, productDTO, null);
            });
            assertEquals("Không tìm thấy sản phẩm", exception.getMessage());
        }

        @Test
        @DisplayName("Cập nhật sản phẩm thất bại khi nguyên liệu không tồn tại")
        void updateProductWithNonExistentMaterial() {
            // Arrange
            ProductMaterialsDTO invalidMaterialDTO = new ProductMaterialsDTO();
            invalidMaterialDTO.setMaterialId(999L); // ID không tồn tại
            invalidMaterialDTO.setQuantity(5);

            productDTO.setMaterials(Collections.singletonList(invalidMaterialDTO));

            when(productsRepository.findById(anyLong())).thenReturn(Optional.of(product));
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(IllegalArgumentException.class, () -> {
                productsService.updateProduct(1L, productDTO, null);
            });
            assertEquals("Nguyên vật liệu không tồn tại!", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Test trường hợp biên với định mức")
    class BoundaryCasesWithMaterials {

        @Test
        @DisplayName("Tạo sản phẩm với định mức số lượng 0")
        void createProductWithZeroQuantityMaterial() throws IOException {
            // Arrange
            ProductMaterialsDTO zeroQuantityDTO = new ProductMaterialsDTO();
            zeroQuantityDTO.setMaterialId(1L);
            zeroQuantityDTO.setQuantity(0);

            productDTO.setMaterials(Collections.singletonList(zeroQuantityDTO));

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(1L)).thenReturn(Optional.of(material1));
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            Product result = productsService.createProduct(productDTO, "Admin");

            // Assert
            assertNotNull(result);
            verify(productMaterialsRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("Tạo sản phẩm với định mức số lượng rất lớn")
        void createProductWithVeryLargeQuantityMaterial() throws IOException {
            // Arrange
            ProductMaterialsDTO largeQuantityDTO = new ProductMaterialsDTO();
            largeQuantityDTO.setMaterialId(1L);
            largeQuantityDTO.setQuantity(Integer.MAX_VALUE);

            productDTO.setMaterials(Collections.singletonList(largeQuantityDTO));

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(materialsRepository.findById(1L)).thenReturn(Optional.of(material1));
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            Product result = productsService.createProduct(productDTO, "Admin");

            // Assert
            assertNotNull(result);
            verify(productMaterialsRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("Tạo sản phẩm với nhiều định mức (50 định mức)")
        void createProductWithManyMaterials() throws IOException {
            // Arrange
            List<ProductMaterialsDTO> manyMaterials = new ArrayList<>();
            List<Material> materials = new ArrayList<>();

            for (int i = 1; i <= 50; i++) {
                ProductMaterialsDTO dto = new ProductMaterialsDTO();
                dto.setMaterialId((long) i);
                dto.setQuantity(i);
                manyMaterials.add(dto);

                Material material = new Material();
                material.setMaterialId((long) i);
                material.setMaterialCode("M" + String.format("%03d", i));
                material.setMaterialName("Vật liệu " + i);
                materials.add(material);

                when(materialsRepository.findById((long) i)).thenReturn(Optional.of(material));
            }

            productDTO.setMaterials(manyMaterials);

            when(productsRepository.existsByProductCode(anyString())).thenReturn(false);
            when(unitRepository.findById(anyLong())).thenReturn(Optional.of(unit));
            when(productTypeRepository.findById(anyLong())).thenReturn(Optional.of(productType));
            when(productsRepository.save(any(Product.class))).thenReturn(product);

            // Act
            Product result = productsService.createProduct(productDTO, "Admin");

            // Assert
            assertNotNull(result);
            verify(productMaterialsRepository).saveAll(anyList());
        }
    }

    @Nested
    @DisplayName("Test nhận ProductsDTO từ entity với định mức")
    class MapEntityToDTO {

        @Test
        @DisplayName("Map entity với định mức sang DTO")
        void mapProductWithMaterialsToDTO() {
            // Arrange
            // Dùng product đã thiết lập ở setUp() với định mức

            // Act
            ProductsDTO result = productsMapper.toDTO(product);

            // Assert
            assertNotNull(result);
            assertNotNull(result.getMaterials());
            assertEquals(2, result.getMaterials().size());

            // Kiểm tra thông tin định mức
            ProductMaterialsDTO firstMaterial = result.getMaterials().get(0);
            assertEquals(1L, firstMaterial.getMaterialId());
            assertEquals("M001", firstMaterial.getMaterialCode());
            assertEquals("Vật liệu 1", firstMaterial.getMaterialName());
            assertEquals(10, firstMaterial.getQuantity());
        }

        @Test
        @DisplayName("Map entity không có định mức sang DTO")
        void mapProductWithoutMaterialsToDTO() {
            // Arrange
            product.setProductMaterials(Collections.emptyList());

            // Act
            ProductsDTO result = productsMapper.toDTO(product);

            // Assert
            assertNotNull(result);
            assertTrue(result.getMaterials().isEmpty());
        }

        @Test
        @DisplayName("Map entity với định mức null sang DTO")
        void mapProductWithNullMaterialsToDTO() {
            // Arrange
            product.setProductMaterials(null);

            // Act
            ProductsDTO result = productsMapper.toDTO(product);

            // Assert
            assertNotNull(result);
            assertNull(result.getMaterials());
        }
    }
}