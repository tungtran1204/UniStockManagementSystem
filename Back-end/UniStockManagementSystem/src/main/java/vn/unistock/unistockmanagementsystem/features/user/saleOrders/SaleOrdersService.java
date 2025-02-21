package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleOrdersService {
    private final SaleOrdersRepository saleOrdersRepository;
    private final SaleOrdersMapper saleOrdersMapper;

    public SaleOrdersService(SaleOrdersRepository saleOrdersRepository, SaleOrdersMapper saleOrdersMapper) {
        this.saleOrdersRepository = saleOrdersRepository;
        this.saleOrdersMapper = saleOrdersMapper;
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
        SalesOrder newOrder = saleOrdersMapper.toEntity(orderDTO);
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
