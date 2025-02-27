package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.Customer;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

import java.util.List;
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
     * Tạo mới một đơn hàng
     */
    @Transactional
    public SaleOrdersDTO createOrder(SaleOrdersDTO orderDTO) {
        Customer customer;
        if (orderDTO.getCustId() != null) {
            // Nếu có customerId, tìm trong database
            customer = customerRepository.findByName(orderDTO.getCustName())
                    .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        } else {
            // Nếu không có customerId, đây là khách mới -> Lưu trước khi tạo đơn hàng
            customer = new Customer();
            customer.setName(orderDTO.getCustName());

            customer = customerRepository.save(customer); // Lưu Customer trước
        }
        // Tạo đơn hàng
        SalesOrder newOrder = saleOrdersMapper.toEntity(orderDTO);
        newOrder.setCustomer(customer);  // Gán customer đã kiểm tra/lưu vào đơn hàng
        SalesOrder savedOrder = saleOrdersRepository.save(newOrder);
        return saleOrdersMapper.toDTO(savedOrder);
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
