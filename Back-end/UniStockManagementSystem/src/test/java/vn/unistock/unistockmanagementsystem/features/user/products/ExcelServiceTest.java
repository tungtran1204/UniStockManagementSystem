package vn.unistock.unistockmanagementsystem.features.user.products;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.ProductType;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExcelServiceTest {

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private ProductTypeRepository productTypeRepository;

    @Mock
    private ProductsRepository productsRepository;

    @InjectMocks
    private ExcelService excelService;

    @Captor
    private ArgumentCaptor<List<Product>> productsCaptor;

    private byte[] createTestExcelFile() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Products");

        // Create header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Product Name");
        headerRow.createCell(1).setCellValue("Description");
        headerRow.createCell(2).setCellValue("Price");
        headerRow.createCell(3).setCellValue("Unit");
        headerRow.createCell(4).setCellValue("Type");
        headerRow.createCell(5).setCellValue("Created By");

        // Create data row 1
        Row dataRow1 = sheet.createRow(1);
        dataRow1.createCell(0).setCellValue("Test Product 1");
        dataRow1.createCell(1).setCellValue("Test Description 1");
        dataRow1.createCell(2).setCellValue("100");
        dataRow1.createCell(3).setCellValue("Piece");
        dataRow1.createCell(4).setCellValue("Electronic");
        dataRow1.createCell(5).setCellValue("Admin");

        // Create data row 2
        Row dataRow2 = sheet.createRow(2);
        dataRow2.createCell(0).setCellValue("Test Product 2");
        dataRow2.createCell(1).setCellValue("Test Description 2");
        dataRow2.createCell(2).setCellValue("200");
        dataRow2.createCell(3).setCellValue("Box");
        dataRow2.createCell(4).setCellValue("Food");
        dataRow2.createCell(5).setCellValue("Admin");

        // Write to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] createInvalidExcelFile() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Products");

        // Create header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Product Name");
        headerRow.createCell(1).setCellValue("Description");
        headerRow.createCell(2).setCellValue("Price");
        headerRow.createCell(3).setCellValue("Unit");
        headerRow.createCell(4).setCellValue("Type");
        headerRow.createCell(5).setCellValue("Created By");

        // Create data row with invalid price
        Row dataRow1 = sheet.createRow(1);
        dataRow1.createCell(0).setCellValue("Test Product 1");
        dataRow1.createCell(1).setCellValue("Test Description 1");
        dataRow1.createCell(2).setCellValue("not-a-number");
        dataRow1.createCell(3).setCellValue("Piece");
        dataRow1.createCell(4).setCellValue("Electronic");
        dataRow1.createCell(5).setCellValue("Admin");

        // Write to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    @Test
    @DisplayName("Should throw exception when file is empty")
    void importProducts_EmptyFile_ThrowsException() {
        // Given
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);

        // When, Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            excelService.importProducts(emptyFile);
        });

        assertEquals("📛 File Excel bị trống!", exception.getMessage());
        verify(productsRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("Should import products successfully from valid Excel file")
    void importProducts_ValidFile_Success() throws IOException {
        // Given
        byte[] fileContent = createTestExcelFile();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileContent);

        Unit unit1 = new Unit();
        unit1.setUnitName("Piece");

        Unit unit2 = new Unit();
        unit2.setUnitName("Box");

        ProductType type1 = new ProductType();
        type1.setTypeName("Electronic");

        ProductType type2 = new ProductType();
        type2.setTypeName("Food");

        when(unitRepository.findByUnitName("Piece")).thenReturn(Optional.of(unit1));
        when(unitRepository.findByUnitName("Box")).thenReturn(Optional.of(unit2));
        when(productTypeRepository.findByTypeName("Electronic")).thenReturn(Optional.of(type1));
        when(productTypeRepository.findByTypeName("Food")).thenReturn(Optional.of(type2));

        // When
        excelService.importProducts(file);

        // Then
        verify(productsRepository).saveAll(productsCaptor.capture());
        List<Product> savedProducts = productsCaptor.getValue();

        assertEquals(2, savedProducts.size());

        // Verify first product
        Product product1 = savedProducts.get(0);
        assertEquals("Test Product 1", product1.getProductName());
        assertEquals("Test Description 1", product1.getDescription());
        assertEquals(unit1, product1.getUnit());
        assertEquals(type1, product1.getProductType());
        assertEquals("Admin", product1.getCreatedBy());

        // Verify second product
        Product product2 = savedProducts.get(1);
        assertEquals("Test Product 2", product2.getProductName());
        assertEquals("Test Description 2", product2.getDescription());
        assertEquals(unit2, product2.getUnit());
        assertEquals(type2, product2.getProductType());
        assertEquals("Admin", product2.getCreatedBy());
    }

    @Test
    @DisplayName("Should create new Unit and ProductType when they don't exist")
    void importProducts_CreatesNewUnitAndType_Success() throws IOException {
        // Given
        byte[] fileContent = createTestExcelFile();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileContent);

        Unit unit1 = new Unit();
        unit1.setUnitName("Piece");

        ProductType type1 = new ProductType();
        type1.setTypeName("Electronic");

        when(unitRepository.findByUnitName("Piece")).thenReturn(Optional.of(unit1));
        when(unitRepository.findByUnitName("Box")).thenReturn(Optional.empty());
        when(productTypeRepository.findByTypeName("Electronic")).thenReturn(Optional.of(type1));
        when(productTypeRepository.findByTypeName("Food")).thenReturn(Optional.empty());

        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> {
            Unit newUnit = invocation.getArgument(0);
            newUnit.setUnitId(2L);
            return newUnit;
        });

        when(productTypeRepository.save(any(ProductType.class))).thenAnswer(invocation -> {
            ProductType newType = invocation.getArgument(0);
            newType.setTypeId(2L);
            return newType;
        });

        // When
        excelService.importProducts(file);

        // Then
        verify(unitRepository).save(any(Unit.class));
        verify(productTypeRepository).save(any(ProductType.class));
        verify(productsRepository).saveAll(productsCaptor.capture());

        List<Product> savedProducts = productsCaptor.getValue();
        assertEquals(2, savedProducts.size());
    }

    @Test
    @DisplayName("Should handle invalid price format in Excel file")
    void importProducts_InvalidPriceFormat_ContinuesProcessing() throws IOException {
        // Given
        byte[] fileContent = createInvalidExcelFile();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileContent);

        when(unitRepository.findByUnitName(anyString())).thenReturn(Optional.empty());
        when(productTypeRepository.findByTypeName(anyString())).thenReturn(Optional.empty());

        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productTypeRepository.save(any(ProductType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When, Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            excelService.importProducts(file);
        });

        assertEquals("📛 Không có sản phẩm hợp lệ để nhập!", exception.getMessage());
        verify(productsRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("Should throw exception when no valid products found")
    void importProducts_NoValidProducts_ThrowsException() throws IOException {
        // Given
        Workbook workbook = new XSSFWorkbook();
        workbook.createSheet("Products");
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", outputStream.toByteArray());

        // When, Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            excelService.importProducts(file);
        });

        assertEquals("📛 Không có sản phẩm hợp lệ để nhập!", exception.getMessage());
        verify(productsRepository, never()).saveAll(any());
    }
}