package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.Customer;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;
import vn.unistock.unistockmanagementsystem.entities.SalesOrderDetail;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SaleOrdersService {
    private final SaleOrdersRepository saleOrdersRepository;
    private final SaleOrdersMapper saleOrdersMapper;
    private final CustomerRepository customerRepository;


    public SaleOrdersService(SaleOrdersRepository saleOrdersRepository, SaleOrdersMapper saleOrdersMapper, CustomerRepository customerRepository) {
        this.saleOrdersRepository = saleOrdersRepository;
        this.saleOrdersMapper = saleOrdersMapper;
        this.customerRepository = customerRepository;
    }

    /**
     * Lấy danh sách tất cả đơn hàng
     */
    public List<SaleOrdersDTO> getAllOrders() {
        return saleOrdersRepository.findAll().stream()
                .map(saleOrdersMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết đơn hàng theo ID
     */
    public SaleOrdersDTO getOrderById(Long orderId) {
        SalesOrder saleOrder = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        return saleOrdersMapper.toDTO(saleOrder);
    }

    /**
     * Lấy chi tiết đơn hàng kèm sản phẩm theo ID cho popup
     */
    public SaleOrdersDTO getOrderDetailsPopup(Long orderId) {
        // Lấy đơn hàng từ repository
        SalesOrder salesOrder = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        // Chuyển đổi sang DTO
        SaleOrdersDTO orderDTO = saleOrdersMapper.toDTO(salesOrder);

        // Lấy thông tin chi tiết sản phẩm
        Set<SalesOrderDetailDTO> detailDTOs = salesOrder.getDetails().stream()
                .map(detail -> {
                    SalesOrderDetailDTO detailDTO = new SalesOrderDetailDTO();
                    detailDTO.setOrderDetailId(detail.getOrderDetailId());
                    detailDTO.setProductId(detail.getProduct().getProductId());
                    detailDTO.setProductName(detail.getProduct().getProductName());
                    detailDTO.setQuantity(detail.getQuantity());
                    detailDTO.setUnitName(detail.getProduct().getUnit().getUnitName());
                    return detailDTO;
                })
                .collect(Collectors.toSet());

        // Gán chi tiết vào DTO
        orderDTO.setOrderDetails(detailDTOs);

        return orderDTO;
    }

    /**
     * Tạo mới một đơn hàng
     */
    @Transactional
    public SaleOrdersDTO createOrder(SaleOrdersDTO orderDTO) {
        System.out.println("📝 Dữ liệu nhận từ frontend: " + orderDTO);

        if (orderDTO.getCustName() == null || orderDTO.getCustName().trim().isEmpty()) {
            System.out.println("🚨 Lỗi: Tên khách hàng bị thiếu!");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên khách hàng không được để trống.");
        }

        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            System.out.println("🚨 Lỗi: Đơn hàng không có sản phẩm!");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn hàng phải có ít nhất một sản phẩm.");
        }

        Customer customer;
        if (orderDTO.getCustId() != null) {
            customer = customerRepository.findByName(orderDTO.getCustName())
                    .orElseThrow(() -> {
                        System.out.println("🚨 Lỗi: Không tìm thấy khách hàng " + orderDTO.getCustName());
                        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khách hàng không tồn tại.");
                    });
        } else {
            System.out.println("✅ Tạo khách hàng mới: " + orderDTO.getCustName());
            customer = new Customer();
            customer.setName(orderDTO.getCustName());
            customer = customerRepository.save(customer);
        }

        System.out.println("✅ Lưu đơn hàng với dữ liệu: " + orderDTO);

        // Thêm log kiểm tra danh sách sản phẩm
        System.out.println("📝 Danh sách sản phẩm:");
        for (SalesOrderDetailDTO detail : orderDTO.getOrderDetails()) {
            System.out.println("🔹 Product ID: " + detail.getProductId() + ", Quantity: " + detail.getQuantity());
        }

        SalesOrder newOrder = saleOrdersMapper.toEntity(orderDTO);

        // Kiểm tra nếu orderDetails chưa được khởi tạo
        if (newOrder.getDetails() == null) {
            newOrder.setDetails(new ArrayList<>()); // Khởi tạo danh sách chi tiết đơn hàng
        }

// Thiết lập order_id cho từng detail
        for (SalesOrderDetail detail : newOrder.getDetails()) {
            detail.setSalesOrder(newOrder);
        }

        newOrder.setCustomer(customer);

        try {
            System.out.println("📝 Kiểm tra danh sách sản phẩm trước khi lưu:");
            for (SalesOrderDetail detail : newOrder.getDetails()) {
                System.out.println("🔹 Product ID: " + detail.getProduct().getProductId() + ", Order ID: " + detail.getSalesOrder());
            }

            SalesOrder savedOrder = saleOrdersRepository.save(newOrder);
            System.out.println("✅ Đơn hàng đã được lưu thành công: " + savedOrder.getOrderId());
            return saleOrdersMapper.toDTO(savedOrder);
        } catch (Exception e) {
            System.out.println("🚨 Lỗi khi lưu đơn hàng: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi tạo đơn hàng", e);
        }
    }


    /**
     * Cập nhật thông tin đơn hàng theo ID
     */
    @Transactional
    public SaleOrdersDTO updateOrder(Long orderId, SaleOrdersDTO orderDTO) {
        SalesOrder existingOrder = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        // Cập nhật thông tin đơn hàng
        existingOrder.setOrderDate(orderDTO.getOrderDate());
        existingOrder.setStatus(orderDTO.getStatus());
        existingOrder.setNote(orderDTO.getNote());

        SalesOrder updatedOrder = saleOrdersRepository.save(existingOrder);
        return saleOrdersMapper.toDTO(updatedOrder);
    }

    /**
     * Xóa đơn hàng theo ID
     */
    @Transactional
    public void deleteOrder(Long orderId) {
        if (!saleOrdersRepository.existsById(orderId)) {
            throw new IllegalArgumentException("Order not found with ID: " + orderId);
        }
        saleOrdersRepository.deleteById(orderId);
    }
}
