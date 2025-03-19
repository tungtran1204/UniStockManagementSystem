package vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.PartnerByType;
import vn.unistock.unistockmanagementsystem.entities.PartnerByTypeKey;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartnerByTypeServiceTest {

    @Mock
    private PartnerByTypeRepository partnerByTypeRepository;

    @Mock
    private PartnerTypeService partnerTypeService;

    @InjectMocks
    private PartnerByTypeService partnerByTypeService;

    private Partner testPartner;
    private PartnerType testPartnerType;
    private String testPartnerCode;

    @BeforeEach
    void setUp() {
        testPartner = Partner.builder()
                .partnerId(1L)
                .partnerName("Test Partner")
                .address("Test Address")
                .phone("0123456789")
                .email("test@example.com")
                .build();

        testPartnerType = PartnerType.builder()
                .typeId(1L)
                .typeCode("GD")
                .typeName("Giao dịch")
                .build();

        testPartnerCode = "GD01";
    }

    @Nested
    @DisplayName("Test createPartnerByCode method")
    class CreatePartnerByCodeTests {

        @Test
        @DisplayName("N01: Tạo PartnerByType thành công với dữ liệu hợp lệ")
        void createPartnerByCode_Success_WithValidData() {
            // Arrange
            String typeCode = "GD";
            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(testPartnerType);

            PartnerByType expectedPartnerByType = new PartnerByType();
            PartnerByTypeKey key = new PartnerByTypeKey(testPartner.getPartnerId(), testPartnerType.getTypeId());
            expectedPartnerByType.setId(key);
            expectedPartnerByType.setPartner(testPartner);
            expectedPartnerByType.setPartnerType(testPartnerType);
            expectedPartnerByType.setPartnerCode(testPartnerCode);

            when(partnerByTypeRepository.save(any(PartnerByType.class))).thenReturn(expectedPartnerByType);

            // Act
            PartnerByType result = partnerByTypeService.createPartnerByCode(testPartner, testPartnerCode);

            // Assert
            assertNotNull(result);
            assertEquals(testPartnerCode, result.getPartnerCode());
            assertEquals(testPartner, result.getPartner());
            assertEquals(testPartnerType, result.getPartnerType());
            verify(partnerTypeService).getPartnerTypeByCode(typeCode);
            verify(partnerByTypeRepository).save(any(PartnerByType.class));
        }

        @Test
        @DisplayName("N02: Kiểm tra đúng PartnerByTypeKey được tạo")
        void createPartnerByCode_CreatesCorrectPartnerByTypeKey() {
            // Arrange
            String typeCode = "GD";
            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(testPartnerType);

            // Capture argument để kiểm tra
            ArgumentCaptor<PartnerByType> partnerByTypeCaptor = ArgumentCaptor.forClass(PartnerByType.class);

            when(partnerByTypeRepository.save(partnerByTypeCaptor.capture())).thenAnswer(invocation -> {
                PartnerByType savedEntity = invocation.getArgument(0);
                return savedEntity;
            });

            // Act
            partnerByTypeService.createPartnerByCode(testPartner, testPartnerCode);

            // Assert
            PartnerByType capturedPartnerByType = partnerByTypeCaptor.getValue();
            assertNotNull(capturedPartnerByType.getId());
            assertEquals(testPartner.getPartnerId(), capturedPartnerByType.getId().getPartnerId());
            assertEquals(testPartnerType.getTypeId(), capturedPartnerByType.getId().getTypeId());
        }

        @Test
        @DisplayName("A01: Ném ngoại lệ khi không tìm thấy PartnerType")
        void createPartnerByCode_ThrowsException_WhenPartnerTypeNotFound() {
            // Arrange
            String typeCode = "XX";
            String invalidPartnerCode = "XX01";
            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(null);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                partnerByTypeService.createPartnerByCode(testPartner, invalidPartnerCode);
            });
            assertEquals("Không tìm thấy nhóm đối tác với mã: " + typeCode, exception.getMessage());
        }

        @Test
        @DisplayName("A02: Xử lý mã đối tác có nhiều số")
        void createPartnerByCode_HandlesComplexPartnerCode() {
            // Arrange
            String typeCode = "ABC";
            String complexPartnerCode = "ABC12345";

            PartnerType abcType = PartnerType.builder()
                    .typeId(3L)
                    .typeCode(typeCode)
                    .typeName("ABC Type")
                    .build();

            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(abcType);
            when(partnerByTypeRepository.save(any(PartnerByType.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            PartnerByType result = partnerByTypeService.createPartnerByCode(testPartner, complexPartnerCode);

            // Assert
            assertNotNull(result);
            assertEquals(complexPartnerCode, result.getPartnerCode());
        }

        @Test
        @DisplayName("A03: Xử lý mã đối tác có ký tự đặc biệt")
        void createPartnerByCode_HandlesSpecialCharactersInTypeCode() {
            // Arrange
            String typeCode = "X-Y";
            String specialPartnerCode = "X-Y-001";

            PartnerType specialType = PartnerType.builder()
                    .typeId(4L)
                    .typeCode(typeCode)
                    .typeName("Special Type")
                    .build();

            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(specialType);
            when(partnerByTypeRepository.save(any(PartnerByType.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            PartnerByType result = partnerByTypeService.createPartnerByCode(testPartner, specialPartnerCode);

            // Assert
            assertNotNull(result);
            assertEquals(specialPartnerCode, result.getPartnerCode());
        }

        @Test
        @DisplayName("A04: Xử lý khi partnerCode không có phần số")
        void createPartnerByCode_HandlesPartnerCodeWithNoNumbers() {
            // Arrange
            String typeCode = "TEST";
            String noNumberPartnerCode = "TEST";

            PartnerType testType = PartnerType.builder()
                    .typeId(6L)
                    .typeCode(typeCode)
                    .typeName("Test Type")
                    .build();

            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(testType);
            when(partnerByTypeRepository.save(any(PartnerByType.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            PartnerByType result = partnerByTypeService.createPartnerByCode(testPartner, noNumberPartnerCode);

            // Assert
            assertNotNull(result);
            assertEquals(noNumberPartnerCode, result.getPartnerCode());
            assertEquals(testPartner, result.getPartner());
            assertEquals(testType, result.getPartnerType());
        }

        @Test
        @DisplayName("B01: Tạo PartnerByType với mã đối tác chỉ có chữ cái")
        void createPartnerByCode_WithLettersOnlyPartnerCode() {
            // Arrange
            String typeCode = "TEST";
            String letterOnlyPartnerCode = "TEST";

            PartnerType letterOnlyType = PartnerType.builder()
                    .typeId(2L)
                    .typeCode(typeCode)
                    .typeName("Test Type")
                    .build();

            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(letterOnlyType);

            PartnerByType expectedPartnerByType = new PartnerByType();
            PartnerByTypeKey key = new PartnerByTypeKey(testPartner.getPartnerId(), letterOnlyType.getTypeId());
            expectedPartnerByType.setId(key);
            expectedPartnerByType.setPartner(testPartner);
            expectedPartnerByType.setPartnerType(letterOnlyType);
            expectedPartnerByType.setPartnerCode(letterOnlyPartnerCode);

            when(partnerByTypeRepository.save(any(PartnerByType.class))).thenReturn(expectedPartnerByType);

            // Act
            PartnerByType result = partnerByTypeService.createPartnerByCode(testPartner, letterOnlyPartnerCode);

            // Assert
            assertNotNull(result);
            assertEquals(letterOnlyPartnerCode, result.getPartnerCode());
            verify(partnerTypeService).getPartnerTypeByCode(typeCode);
        }

        @Test
        @DisplayName("B02: Tạo PartnerByType với mã đối tác có số và chữ")
        void createPartnerByCode_WithAlphanumericPartnerCode() {
            // Arrange
            String typeCode = "GD";
            String alphanumericPartnerCode = "GD123ABC";
            when(partnerTypeService.getPartnerTypeByCode(typeCode)).thenReturn(testPartnerType);

            PartnerByType expectedPartnerByType = new PartnerByType();
            PartnerByTypeKey key = new PartnerByTypeKey(testPartner.getPartnerId(), testPartnerType.getTypeId());
            expectedPartnerByType.setId(key);
            expectedPartnerByType.setPartner(testPartner);
            expectedPartnerByType.setPartnerType(testPartnerType);
            expectedPartnerByType.setPartnerCode(alphanumericPartnerCode);

            when(partnerByTypeRepository.save(any(PartnerByType.class))).thenReturn(expectedPartnerByType);

            // Act
            PartnerByType result = partnerByTypeService.createPartnerByCode(testPartner, alphanumericPartnerCode);

            // Assert
            assertNotNull(result);
            assertEquals(alphanumericPartnerCode, result.getPartnerCode());
        }
    }

    @Nested
    @DisplayName("Test generatePartnerCode method")
    class GeneratePartnerCodeTests {

        @Test
        @DisplayName("N01: Tạo mã đối tác thành công với typeId hợp lệ")
        void generatePartnerCode_Success_WithValidTypeId() {
            // Arrange
            Long typeId = 1L;
            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(testPartnerType);
            when(partnerByTypeRepository.countByPartnerType(testPartnerType)).thenReturn(0);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("GD01", result);
            verify(partnerTypeService).getPartnerTypeById(typeId);
            verify(partnerByTypeRepository).countByPartnerType(testPartnerType);
        }

        @Test
        @DisplayName("N02: Format số tuần tự đúng khi có ít hơn 10 đối tác")
        void generatePartnerCode_FormatsSequenceNumberCorrectly_LessThanTen() {
            // Arrange
            Long typeId = 1L;
            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(testPartnerType);
            when(partnerByTypeRepository.countByPartnerType(testPartnerType)).thenReturn(5);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("GD06", result);  // 5 + 1 = 6, format là 06
        }

        @Test
        @DisplayName("N03: Tạo mã đối tác khi chưa có đối tác nào cùng loại")
        void generatePartnerCode_WhenNoPartnersExist() {
            // Arrange
            Long typeId = 1L;
            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(testPartnerType);
            when(partnerByTypeRepository.countByPartnerType(testPartnerType)).thenReturn(0);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("GD01", result);  // Đối tác đầu tiên
        }

        @Test
        @DisplayName("A01: Ném ngoại lệ khi không tìm thấy PartnerType")
        void generatePartnerCode_ThrowsException_WhenPartnerTypeNotFound() {
            // Arrange
            Long invalidTypeId = 999L;
            when(partnerTypeService.getPartnerTypeById(invalidTypeId)).thenReturn(null);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                partnerByTypeService.generatePartnerCode(invalidTypeId);
            });
            assertEquals("Nhóm đối tác không tồn tại!", exception.getMessage());
        }

        @Test
        @DisplayName("B01: Tạo mã đối tác khi đã có 9 đối tác cùng loại")
        void generatePartnerCode_WhenNinePartnersExist() {
            // Arrange
            Long typeId = 1L;
            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(testPartnerType);
            when(partnerByTypeRepository.countByPartnerType(testPartnerType)).thenReturn(9);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("GD10", result);
        }

        @Test
        @DisplayName("B02: Tạo mã đối tác khi đã có 99 đối tác cùng loại")
        void generatePartnerCode_WhenNinetyNinePartnersExist() {
            // Arrange
            Long typeId = 1L;
            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(testPartnerType);
            when(partnerByTypeRepository.countByPartnerType(testPartnerType)).thenReturn(99);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("GD100", result);
        }

        @Test
        @DisplayName("B03: Tạo mã đối tác với loại có mã dài")
        void generatePartnerCode_WithLongTypeCode() {
            // Arrange
            Long typeId = 5L;
            PartnerType longCodeType = PartnerType.builder()
                    .typeId(typeId)
                    .typeCode("LONGCODE")
                    .typeName("Long Code Type")
                    .build();

            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(longCodeType);
            when(partnerByTypeRepository.countByPartnerType(longCodeType)).thenReturn(7);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("LONGCODE08", result);
        }

        @Test
        @DisplayName("B04: Kiểm tra với số lượng đối tác lớn")
        void generatePartnerCode_WithLargeNumberOfPartners() {
            // Arrange
            Long typeId = 1L;
            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(testPartnerType);
            when(partnerByTypeRepository.countByPartnerType(testPartnerType)).thenReturn(999);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("GD1000", result);
        }

        @Test
        @DisplayName("B05: Kiểm tra với mã loại đối tác ngắn")
        void generatePartnerCode_WithShortTypeCode() {
            // Arrange
            Long typeId = 7L;
            PartnerType shortCodeType = PartnerType.builder()
                    .typeId(typeId)
                    .typeCode("X")
                    .typeName("Short Code Type")
                    .build();

            when(partnerTypeService.getPartnerTypeById(typeId)).thenReturn(shortCodeType);
            when(partnerByTypeRepository.countByPartnerType(shortCodeType)).thenReturn(12);

            // Act
            String result = partnerByTypeService.generatePartnerCode(typeId);

            // Assert
            assertEquals("X13", result);
        }
    }
}