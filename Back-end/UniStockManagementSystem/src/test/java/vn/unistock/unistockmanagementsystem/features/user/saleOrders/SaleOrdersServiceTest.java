package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;
import vn.unistock.unistockmanagementsystem.entities.SalesOrderDetail;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleOrdersServiceTest {

    @Mock
    private SaleOrdersRepository saleOrdersRepository;

    @Mock
    private SaleOrdersMapper saleOrdersMapper;

    @Mock
    private PartnerRepository partnerRepository;

    @InjectMocks
    private SaleOrdersService saleOrdersService;

    private SalesOrder mockSalesOrder;
    private SaleOrdersDTO mockSaleOrdersDTO;
    private Partner mockPartner;
    private List<SalesOrderDetail> mockOrderDetails;
    private Set<SalesOrderDetailDTO> mockDetailDTOs;

    @BeforeEach
    void setUp() {
        // Setup mock Partner
        mockPartner = new Partner();
        mockPartner.setPartnerId(1L);
        mockPartner.setPartnerName("Test Partner");

        // Setup mock Unit
        Unit mockUnit = new Unit();
        mockUnit.setUnitId(1L);
        mockUnit.setUnitName("PCS");

        // Setup mock Product
        Product mockProduct = new Product();
        mockProduct.setProductId(1L);
        mockProduct.setProductName("Test Product");
        mockProduct.setUnit(mockUnit);

        // Setup mock SalesOrderDetail
        SalesOrderDetail mockDetail = new SalesOrderDetail();
        mockDetail.setOrderDetailId(1L);
        mockDetail.setProduct(mockProduct);
        mockDetail.setQuantity(10);

        mockOrderDetails = new ArrayList<>();
        mockOrderDetails.add(mockDetail);

        // Setup mock SalesOrder
        mockSalesOrder = new SalesOrder();
        mockSalesOrder.setOrderId(1L);
        mockSalesOrder.setPartner(mockPartner);
        mockSalesOrder.setStatus("New");
        mockSalesOrder.setOrderDate(new Date());
        mockSalesOrder.setNote("Test Note");
        mockSalesOrder.setDetails(mockOrderDetails);

        // Setup mock DetailDTO
        SalesOrderDetailDTO detailDTO = new SalesOrderDetailDTO();
        detailDTO.setOrderDetailId(1L);
        detailDTO.setProductId(1L);
        detailDTO.setProductName("Test Product");
        detailDTO.setQuantity(10);
        detailDTO.setUnitName("PCS");

        mockDetailDTOs = new HashSet<>();
        mockDetailDTOs.add(detailDTO);

        // Setup mock SaleOrdersDTO
        mockSaleOrdersDTO = new SaleOrdersDTO();
        mockSaleOrdersDTO.setOrderId(1L);
        mockSaleOrdersDTO.setPartnerId(1L);
        mockSaleOrdersDTO.setPartnerName("Test Partner");
        mockSaleOrdersDTO.setStatus("New");
        mockSaleOrdersDTO.setOrderDate(new Date());
        mockSaleOrdersDTO.setNote("Test Note");
        mockSaleOrdersDTO.setOrderDetails(mockDetailDTOs);

        // Configure mapper behavior
        when(saleOrdersMapper.toDTO(any(SalesOrder.class))).thenReturn(mockSaleOrdersDTO);
        when(saleOrdersMapper.toEntity(any(SaleOrdersDTO.class))).thenReturn(mockSalesOrder);
    }

    @Test
    @DisplayName("Should return all orders")
    void getAllOrders_ShouldReturnAllOrders() {
        // Arrange
        List<SalesOrder> salesOrders = Collections.singletonList(mockSalesOrder);
        when(saleOrdersRepository.findAll()).thenReturn(salesOrders);

        // Act
        List<SaleOrdersDTO> result = saleOrdersService.getAllOrders();

        // Assert
        assertEquals(1, result.size());
        assertEquals(mockSaleOrdersDTO, result.get(0));
        verify(saleOrdersRepository).findAll();
        verify(saleOrdersMapper).toDTO(mockSalesOrder);
    }

    @Test
    @DisplayName("Should return order by ID when exists")
    void getOrderById_WhenOrderExists_ShouldReturnOrder() {
        // Arrange
        when(saleOrdersRepository.findById(1L)).thenReturn(Optional.of(mockSalesOrder));

        // Act
        SaleOrdersDTO result = saleOrdersService.getOrderById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(mockSaleOrdersDTO, result);
        verify(saleOrdersRepository).findById(1L);
        verify(saleOrdersMapper).toDTO(mockSalesOrder);
    }

    @Test
    @DisplayName("Should throw exception when getting order by non-existent ID")
    void getOrderById_WhenOrderDoesNotExist_ShouldThrowException() {
        // Arrange
        when(saleOrdersRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                saleOrdersService.getOrderById(999L)
        );
        assertTrue(exception.getMessage().contains("Order not found"));
        verify(saleOrdersRepository).findById(999L);
        verify(saleOrdersMapper, never()).toDTO(any(SalesOrder.class));
    }

    @Test
    @DisplayName("Should return order details for popup")
    void getOrderDetailsPopup_WhenOrderExists_ShouldReturnOrderDetails() {
        // Arrange
        when(saleOrdersRepository.findById(1L)).thenReturn(Optional.of(mockSalesOrder));

        // Act
        SaleOrdersDTO result = saleOrdersService.getOrderDetailsPopup(1L);

        // Assert
        assertNotNull(result);
        assertEquals(mockSaleOrdersDTO, result);
        verify(saleOrdersRepository).findById(1L);
        verify(saleOrdersMapper).toDTO(mockSalesOrder);
    }

    @Test
    @DisplayName("Should throw exception when getting order details for non-existent ID")
    void getOrderDetailsPopup_WhenOrderDoesNotExist_ShouldThrowException() {
        // Arrange
        when(saleOrdersRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                saleOrdersService.getOrderDetailsPopup(999L)
        );
        assertTrue(exception.getMessage().contains("Order not found"));
        verify(saleOrdersRepository).findById(999L);
    }

    @Test
    @DisplayName("Should create new order successfully with existing partner")
    void createOrder_WithExistingPartner_ShouldCreateOrder() {
        // Arrange
        when(partnerRepository.findByPartnerName("Test Partner")).thenReturn(Optional.of(mockPartner));
        when(saleOrdersRepository.save(any(SalesOrder.class))).thenReturn(mockSalesOrder);

        // Act
        SaleOrdersDTO result = saleOrdersService.createOrder(mockSaleOrdersDTO);

        // Assert
        assertNotNull(result);
        assertEquals(mockSaleOrdersDTO, result);
        verify(partnerRepository).findByPartnerName("Test Partner");
        verify(saleOrdersRepository).save(any(SalesOrder.class));
        verify(saleOrdersMapper).toDTO(mockSalesOrder);
    }

    @Test
    @DisplayName("Should create new order successfully with new partner")
    void createOrder_WithNewPartner_ShouldCreateOrderAndPartner() {
        // Arrange
        SaleOrdersDTO newOrderDTO = new SaleOrdersDTO();
        newOrderDTO.setPartnerId(null); // Indicates new partner
        newOrderDTO.setPartnerName("New Partner");
        newOrderDTO.setOrderDetails(mockDetailDTOs);

        Partner newPartner = new Partner();
        newPartner.setPartnerName("New Partner");
        newPartner.setPartnerId(2L);

        when(partnerRepository.save(any(Partner.class))).thenReturn(newPartner);
        when(saleOrdersRepository.save(any(SalesOrder.class))).thenReturn(mockSalesOrder);

        // Act
        SaleOrdersDTO result = saleOrdersService.createOrder(newOrderDTO);

        // Assert
        assertNotNull(result);
        assertEquals(mockSaleOrdersDTO, result);
        verify(partnerRepository).save(any(Partner.class));
        verify(saleOrdersRepository).save(any(SalesOrder.class));
        verify(saleOrdersMapper).toDTO(mockSalesOrder);
    }

    @Test
    @DisplayName("Should throw exception when creating order with missing partner name")
    void createOrder_WithMissingPartnerName_ShouldThrowException() {
        // Arrange
        SaleOrdersDTO invalidDTO = new SaleOrdersDTO();
        invalidDTO.setPartnerName(""); // Empty partner name
        invalidDTO.setOrderDetails(mockDetailDTOs);

        // Act & Assert
        Exception exception = assertThrows(ResponseStatusException.class, () ->
                saleOrdersService.createOrder(invalidDTO)
        );
        assertTrue(exception.getMessage().contains("Tên khách hàng không được để trống"));
        verify(saleOrdersRepository, never()).save(any(SalesOrder.class));
    }

    @Test
    @DisplayName("Should throw exception when creating order with no products")
    void createOrder_WithNoProducts_ShouldThrowException() {
        // Arrange
        SaleOrdersDTO invalidDTO = new SaleOrdersDTO();
        invalidDTO.setPartnerName("Test Partner");
        invalidDTO.setOrderDetails(new HashSet<>()); // Empty order details

        // Act & Assert
        Exception exception = assertThrows(ResponseStatusException.class, () ->
                saleOrdersService.createOrder(invalidDTO)
        );
        assertTrue(exception.getMessage().contains("Đơn hàng phải có ít nhất một sản phẩm"));
        verify(saleOrdersRepository, never()).save(any(SalesOrder.class));
    }

    @Test
    @DisplayName("Should throw exception when creating order with non-existent partner")
    void createOrder_WithNonExistentPartner_ShouldThrowException() {
        // Arrange
        SaleOrdersDTO orderDTO = new SaleOrdersDTO();
        orderDTO.setPartnerId(999L);
        orderDTO.setPartnerName("Non-existent Partner");
        orderDTO.setOrderDetails(mockDetailDTOs);

        when(partnerRepository.findByPartnerName("Non-existent Partner")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(ResponseStatusException.class, () ->
                saleOrdersService.createOrder(orderDTO)
        );
        assertTrue(exception.getMessage().contains("Khách hàng không tồn tại"));
        verify(saleOrdersRepository, never()).save(any(SalesOrder.class));
    }

    @Test
    @DisplayName("Should update order successfully")
    void updateOrder_WhenOrderExists_ShouldUpdateOrder() {
        // Arrange
        when(saleOrdersRepository.findById(1L)).thenReturn(Optional.of(mockSalesOrder));
        when(saleOrdersRepository.save(any(SalesOrder.class))).thenReturn(mockSalesOrder);

        SaleOrdersDTO updateDTO = new SaleOrdersDTO();
        updateDTO.setStatus("Updated");
        updateDTO.setOrderDate(new Date());
        updateDTO.setNote("Updated Note");

        // Act
        SaleOrdersDTO result = saleOrdersService.updateOrder(1L, updateDTO);

        // Assert
        assertNotNull(result);
        verify(saleOrdersRepository).findById(1L);
        verify(saleOrdersRepository).save(mockSalesOrder);
        verify(saleOrdersMapper).toDTO(mockSalesOrder);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent order")
    void updateOrder_WhenOrderDoesNotExist_ShouldThrowException() {
        // Arrange
        when(saleOrdersRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                saleOrdersService.updateOrder(999L, mockSaleOrdersDTO)
        );
        assertTrue(exception.getMessage().contains("Order not found"));
        verify(saleOrdersRepository).findById(999L);
        verify(saleOrdersRepository, never()).save(any(SalesOrder.class));
    }

    @Test
    @DisplayName("Should delete order successfully")
    void deleteOrder_WhenOrderExists_ShouldDeleteOrder() {
        // Arrange
        when(saleOrdersRepository.existsById(1L)).thenReturn(true);
        doNothing().when(saleOrdersRepository).deleteById(1L);

        // Act
        saleOrdersService.deleteOrder(1L);

        // Assert
        verify(saleOrdersRepository).existsById(1L);
        verify(saleOrdersRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent order")
    void deleteOrder_WhenOrderDoesNotExist_ShouldThrowException() {
        // Arrange
        when(saleOrdersRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                saleOrdersService.deleteOrder(999L)
        );
        assertTrue(exception.getMessage().contains("Order not found"));
        verify(saleOrdersRepository).existsById(999L);
        verify(saleOrdersRepository, never()).deleteById(any());
    }
}