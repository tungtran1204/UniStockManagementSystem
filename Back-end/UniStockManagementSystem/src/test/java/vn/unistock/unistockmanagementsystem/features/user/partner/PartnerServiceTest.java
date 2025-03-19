package vn.unistock.unistockmanagementsystem.features.user.partner;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.PartnerByType;
import vn.unistock.unistockmanagementsystem.entities.PartnerType;
import vn.unistock.unistockmanagementsystem.features.user.partner.partnerByType.PartnerByTypeService;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartnerServiceTest {

    @Mock
    private PartnerRepository partnerRepository;

    @Mock
    private PartnerMapper partnerMapper;

    @Mock
    private PartnerTypeService partnerTypeService;

    @Mock
    private PartnerByTypeService partnerByTypeService;

    @InjectMocks
    private PartnerService partnerService;

    private Partner testPartner;
    private PartnerDTO testPartnerDTO;
    private Page<Partner> partnerPage;

    @BeforeEach
    void setUp() {
        // Khởi tạo đối tượng test
        testPartner = Partner.builder()
                .partnerId(1L)
                .partnerName("Test Partner")
                .address("Test Address")
                .phone("0123456789")
                .email("test@example.com")
                .partnerTypes(new HashSet<>())
                .build();

        testPartnerDTO = PartnerDTO.builder()
                .partnerId(1L)
                .partnerName("Test Partner")
                .address("Test Address")
                .phone("0123456789")
                .email("test@example.com")
                .partnerCodes(List.of("GD01"))
                .build();

        List<Partner> partners = new ArrayList<>();
        partners.add(testPartner);
        partnerPage = new PageImpl<>(partners);
    }

    @Nested
    @DisplayName("Test getAllPartners method")
    class GetAllPartnersTests {

        @Test
        @DisplayName("N01: Lấy danh sách đối tác thành công khi có dữ liệu")
        void getAllPartners_ReturnsPageOfPartners_WhenPartnersExist() {
            // Arrange
            int page = 0;
            int size = 10;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findAll(pageable)).thenReturn(partnerPage);
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(testPartnerDTO);

            // Act
            Page<PartnerDTO> result = partnerService.getAllPartners(page, size);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            verify(partnerRepository).findAll(pageable);
        }

        @Test
        @DisplayName("N02: Trả về trang trống khi không có đối tác nào")
        void getAllPartners_ReturnsEmptyPage_WhenNoPartnersExist() {
            // Arrange
            int page = 0;
            int size = 10;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findAll(pageable)).thenReturn(Page.empty());

            // Act
            Page<PartnerDTO> result = partnerService.getAllPartners(page, size);

            // Assert
            assertNotNull(result);
            assertEquals(0, result.getTotalElements());
            verify(partnerRepository).findAll(pageable);
        }

        @Test
        @DisplayName("B01: Kiểm tra với trang đầu tiên và kích thước nhỏ nhất")
        void getAllPartners_WithMinimumPageAndSize() {
            // Arrange
            int page = 0;
            int size = 1;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findAll(pageable)).thenReturn(partnerPage);
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(testPartnerDTO);

            // Act
            Page<PartnerDTO> result = partnerService.getAllPartners(page, size);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).findAll(pageable);
        }

        @Test
        @DisplayName("B02: Kiểm tra với trang lớn và kích thước lớn")
        void getAllPartners_WithLargePageAndSize() {
            // Arrange
            int page = 100;
            int size = 100;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findAll(pageable)).thenReturn(Page.empty());

            // Act
            Page<PartnerDTO> result = partnerService.getAllPartners(page, size);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("Test createPartner method")
    class CreatePartnerTests {

        @Test
        @DisplayName("N01: Tạo đối tác mới thành công với dữ liệu hợp lệ")
        void createPartner_Success_WithValidData() {
            // Arrange
            when(partnerRepository.existsByPartnerName(testPartnerDTO.getPartnerName())).thenReturn(false);
            when(partnerRepository.save(any(Partner.class))).thenReturn(testPartner);
            when(partnerByTypeService.createPartnerByCode(any(Partner.class), anyString())).thenReturn(mock(PartnerByType.class));
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(testPartnerDTO);

            // Act
            PartnerDTO result = partnerService.createPartner(testPartnerDTO);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).existsByPartnerName(testPartnerDTO.getPartnerName());
            verify(partnerRepository, times(2)).save(any(Partner.class));
            verify(partnerByTypeService).createPartnerByCode(any(Partner.class), eq("GD01"));
        }

        @Test
        @DisplayName("A01: Ném ngoại lệ khi không có mã đối tác")
        void createPartner_ThrowsException_WhenPartnerCodesIsNull() {
            // Arrange
            PartnerDTO partnerDTOWithNullCodes = PartnerDTO.builder()
                    .partnerName("Test Partner")
                    .address("Test Address")
                    .phone("0123456789")
                    .email("test@example.com")
                    .partnerCodes(null)
                    .build();

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                partnerService.createPartner(partnerDTOWithNullCodes);
            });
            assertEquals("NO_PARTNER_TYPE", exception.getMessage());
        }

        @Test
        @DisplayName("A02: Ném ngoại lệ khi danh sách mã đối tác rỗng")
        void createPartner_ThrowsException_WhenPartnerCodesIsEmpty() {
            // Arrange
            PartnerDTO partnerDTOWithEmptyCodes = PartnerDTO.builder()
                    .partnerName("Test Partner")
                    .address("Test Address")
                    .phone("0123456789")
                    .email("test@example.com")
                    .partnerCodes(Collections.emptyList())
                    .build();

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                partnerService.createPartner(partnerDTOWithEmptyCodes);
            });
            assertEquals("NO_PARTNER_TYPE", exception.getMessage());
        }

        @Test
        @DisplayName("A03: Ném ngoại lệ khi tên đối tác đã tồn tại")
        void createPartner_ThrowsException_WhenPartnerNameExists() {
            // Arrange
            when(partnerRepository.existsByPartnerName(testPartnerDTO.getPartnerName())).thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
                partnerService.createPartner(testPartnerDTO);
            });
            assertEquals("DUPLICATE_NAME", exception.getMessage());
        }

        @Test
        @DisplayName("B01: Tạo đối tác với các thông tin tối thiểu")
        void createPartner_WithMinimumRequiredFields() {
            // Arrange
            PartnerDTO minimalPartnerDTO = PartnerDTO.builder()
                    .partnerName("Min Partner")
                    .partnerCodes(List.of("GD01"))
                    .build();

            Partner minimalPartner = Partner.builder()
                    .partnerId(1L)
                    .partnerName("Min Partner")
                    .partnerTypes(new HashSet<>())
                    .build();

            when(partnerRepository.existsByPartnerName(minimalPartnerDTO.getPartnerName())).thenReturn(false);
            when(partnerRepository.save(any(Partner.class))).thenReturn(minimalPartner);
            when(partnerByTypeService.createPartnerByCode(any(Partner.class), anyString())).thenReturn(mock(PartnerByType.class));
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(minimalPartnerDTO);

            // Act
            PartnerDTO result = partnerService.createPartner(minimalPartnerDTO);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).existsByPartnerName(minimalPartnerDTO.getPartnerName());
            verify(partnerRepository, times(2)).save(any(Partner.class));
        }

        @Test
        @DisplayName("B02: Tạo đối tác với nhiều mã đối tác")
        void createPartner_WithMultiplePartnerCodes() {
            // Arrange
            PartnerDTO multiCodesPartnerDTO = PartnerDTO.builder()
                    .partnerName("Multi Codes Partner")
                    .address("Test Address")
                    .phone("0123456789")
                    .email("test@example.com")
                    .partnerCodes(List.of("GD01", "KH02", "NCC03"))
                    .build();

            when(partnerRepository.existsByPartnerName(multiCodesPartnerDTO.getPartnerName())).thenReturn(false);
            when(partnerRepository.save(any(Partner.class))).thenReturn(testPartner);
            when(partnerByTypeService.createPartnerByCode(any(Partner.class), anyString())).thenReturn(mock(PartnerByType.class));
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(multiCodesPartnerDTO);

            // Act
            PartnerDTO result = partnerService.createPartner(multiCodesPartnerDTO);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).existsByPartnerName(multiCodesPartnerDTO.getPartnerName());
            verify(partnerByTypeService, times(3)).createPartnerByCode(any(Partner.class), anyString());
            verify(partnerRepository, times(2)).save(any(Partner.class));
        }


    }

    @Nested
    @DisplayName("Test getPartnersByType method")
    class GetPartnersByTypeTests {

        @Test
        @DisplayName("N01: Lấy danh sách đối tác theo loại thành công")
        void getPartnersByType_ReturnsPartners_WhenTypeExists() {
            // Arrange
            Long typeId = 1L;
            int page = 0;
            int size = 10;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findByPartnerTypes_PartnerType_typeId(typeId, pageable)).thenReturn(partnerPage);
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(testPartnerDTO);

            // Act
            Page<PartnerDTO> result = partnerService.getPartnersByType(typeId, page, size);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            verify(partnerRepository).findByPartnerTypes_PartnerType_typeId(typeId, pageable);
        }

        @Test
        @DisplayName("N02: Trả về trang trống khi không có đối tác thuộc loại đã chọn")
        void getPartnersByType_ReturnsEmptyPage_WhenNoPartnersWithTypeExist() {
            // Arrange
            Long typeId = 1L;
            int page = 0;
            int size = 10;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findByPartnerTypes_PartnerType_typeId(typeId, pageable)).thenReturn(Page.empty());

            // Act
            Page<PartnerDTO> result = partnerService.getPartnersByType(typeId, page, size);

            // Assert
            assertNotNull(result);
            assertEquals(0, result.getTotalElements());
            verify(partnerRepository).findByPartnerTypes_PartnerType_typeId(typeId, pageable);
        }

        @Test
        @DisplayName("A01: Tìm kiếm với typeId không tồn tại")
        void getPartnersByType_WithNonExistentTypeId() {
            // Arrange
            Long nonExistentTypeId = 999L;
            int page = 0;
            int size = 10;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findByPartnerTypes_PartnerType_typeId(nonExistentTypeId, pageable)).thenReturn(Page.empty());

            // Act
            Page<PartnerDTO> result = partnerService.getPartnersByType(nonExistentTypeId, page, size);

            // Assert
            assertNotNull(result);
            assertEquals(0, result.getTotalElements());
            verify(partnerRepository).findByPartnerTypes_PartnerType_typeId(nonExistentTypeId, pageable);
        }

        @Test
        @DisplayName("B01: Tìm kiếm với trang đầu tiên và kích thước nhỏ nhất")
        void getPartnersByType_WithMinimumPageAndSize() {
            // Arrange
            Long typeId = 1L;
            int page = 0;
            int size = 1;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findByPartnerTypes_PartnerType_typeId(typeId, pageable)).thenReturn(partnerPage);
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(testPartnerDTO);

            // Act
            Page<PartnerDTO> result = partnerService.getPartnersByType(typeId, page, size);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).findByPartnerTypes_PartnerType_typeId(typeId, pageable);
        }

        @Test
        @DisplayName("B02: Tìm kiếm với trang lớn và kích thước lớn")
        void getPartnersByType_WithLargePageAndSize() {
            // Arrange
            Long typeId = 1L;
            int page = 100;
            int size = 100;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findByPartnerTypes_PartnerType_typeId(typeId, pageable)).thenReturn(Page.empty());

            // Act
            Page<PartnerDTO> result = partnerService.getPartnersByType(typeId, page, size);

            // Assert
            assertNotNull(result);
            verify(partnerRepository).findByPartnerTypes_PartnerType_typeId(typeId, pageable);
        }

        @Test
        @DisplayName("N03: Kiểm tra mapper được gọi đúng số lần")
        void getPartnersByType_CallsMapperCorrectly() {
            // Arrange
            Long typeId = 1L;
            int page = 0;
            int size = 10;
            Pageable pageable = PageRequest.of(page, size);

            when(partnerRepository.findByPartnerTypes_PartnerType_typeId(typeId, pageable)).thenReturn(partnerPage);
            when(partnerMapper.toDTO(any(Partner.class))).thenReturn(testPartnerDTO);

            // Act
            partnerService.getPartnersByType(typeId, page, size);

            // Assert
            verify(partnerMapper).toDTO(testPartner);
        }
    }
}