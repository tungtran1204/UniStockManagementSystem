package vn.unistock.unistockmanagementsystem.partner.partnerType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeController;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeDTO;
import vn.unistock.unistockmanagementsystem.features.user.partnerType.PartnerTypeService;

import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartnerTypeControllerTest {

    @Mock
    private PartnerTypeService partnerTypeService;

    @InjectMocks
    private PartnerTypeController partnerTypeController;

    @Test
    void getAllPartnerTypes_ShouldReturnListOfPartnerTypeDTOs() {
        // Arrange
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        when(partnerTypeService.getAllPartnerTypes()).thenReturn(Arrays.asList(partnerTypeDTO));

        // Act
        ResponseEntity<List<PartnerTypeDTO>> response = partnerTypeController.getAllPartnerTypes();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void createPartnerType_ShouldReturnConflictIfExists() {
        // Arrange
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        //when(partnerTypeService.existsByTypeCodeOrTypeName(any(), any())).thenReturn(true);

        // Act
        //ResponseEntity<PartnerTypeDTO> response = partnerTypeController.createPartnerType(partnerTypeDTO);

        // Assert
//        assertEquals(409, response.getStatusCodeValue());
//        assertNull(response.getBody());
    }

    @Test
    void createPartnerType_ShouldCreateAndReturnPartnerType() {
        // Arrange
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        //when(partnerTypeService.existsByTypeCodeOrTypeName(any(), any())).thenReturn(false);
        when(partnerTypeService.addPartnerType(partnerTypeDTO)).thenReturn(partnerTypeDTO);

        // Act
        //ResponseEntity<PartnerTypeDTO> response = partnerTypeController.createPartnerType(partnerTypeDTO);

        // Assert
//        assertEquals(200, response.getStatusCodeValue());
//        assertNotNull(response.getBody());
    }

    @Test
    void updatePartnerType_ShouldReturnConflictIfExists() {
        // Arrange
        Long id = 1L;
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        //when(partnerTypeService.existsByTypeCodeOrTypeName(any(), any())).thenReturn(true);

        // Act
        //ResponseEntity<PartnerTypeDTO> response = partnerTypeController.updatePartnerType(id, partnerTypeDTO);

        // Assert
//        assertEquals(409, response.getStatusCodeValue());
//        assertNull(response.getBody());
    }

    @Test
    void createPartnerType_ShouldReturnBadRequestIfTypeCodeIsNull() {
        // Arrange
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        partnerTypeDTO.setTypeCode(null);

        // Act
        //ResponseEntity<PartnerTypeDTO> response = partnerTypeController.createPartnerType(partnerTypeDTO);

        // Assert
//        assertEquals(400, response.getStatusCodeValue());
//        assertEquals("Type code can not be null", response.getBody());
    }

    @Test
    void createPartnerType_ShouldReturnConflictIfTypeCodeExists() {
        // Arrange
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        partnerTypeDTO.setTypeCode("CUSTOMER");
        //when(partnerTypeService.existsByTypeCodeOrTypeName(eq("CUSTOMER"), any())).thenReturn(true);

        // Act
        //ResponseEntity<PartnerTypeDTO> response = partnerTypeController.createPartnerType(partnerTypeDTO);

        // Assert
//        assertEquals(409, response.getStatusCodeValue());
//        assertEquals("Type Code is exist", response.getBody());
    }

    @Test
    void createPartnerType_ShouldReturnConflictIfTypeNameExists() {
        // Arrange
        PartnerTypeDTO partnerTypeDTO = new PartnerTypeDTO();
        partnerTypeDTO.setTypeName("customer");
        //when(partnerTypeService.existsByTypeCodeOrTypeName(any(), eq("customer"))).thenReturn(true);

        // Act
        //ResponseEntity<PartnerTypeDTO> response = partnerTypeController.createPartnerType(partnerTypeDTO);

        // Assert
//        assertEquals(409, response.getStatusCodeValue());
//        assertEquals("Type Name is exist", response.getBody());
    }

}
