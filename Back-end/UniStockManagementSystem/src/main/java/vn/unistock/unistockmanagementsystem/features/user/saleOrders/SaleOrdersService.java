package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;
import vn.unistock.unistockmanagementsystem.entities.SalesOrderDetail;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SaleOrdersService {
    private final SaleOrdersRepository saleOrdersRepository;
    private final SaleOrdersMapper saleOrdersMapper;
    private final PartnerRepository partnerRepository;


    public SaleOrdersService(SaleOrdersRepository saleOrdersRepository, SaleOrdersMapper saleOrdersMapper, PartnerRepository partnerRepository) {
        this.saleOrdersRepository = saleOrdersRepository;
        this.saleOrdersMapper = saleOrdersMapper;
        this.partnerRepository = partnerRepository;
    }

    /**
     * Lấy danh sách tất cả đơn hàng
     */
    public Page<SaleOrdersDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SalesOrder> salesOrderPage = saleOrdersRepository.findAll(pageable);
        return salesOrderPage.map(saleOrdersMapper::toDTO);
    }

    public String getNextOrderCode() {

        Long maxId = saleOrdersRepository.findMaxOrderId(); // SELECT MAX(order_id)
        Long nextId = (maxId != null ? maxId : 0L) + 1;
        return String.format("ĐH%05d", nextId);
    }

    public SaleOrdersDTO getOrderById(Long orderId) {
        SalesOrder saleOrder = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        return saleOrdersMapper.toDTO(saleOrder);
    }

    /**
     * Lấy chi tiết đơn hàng kèm sản phẩm theo ID cho popup
     */
    public SaleOrdersDTO getOrderDetail(Long orderId) {
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

        if (orderDTO.getPartnerName() == null || orderDTO.getPartnerName().trim().isEmpty()) {
            System.out.println("🚨 Lỗi: Tên khách hàng bị thiếu!");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên khách hàng không được để trống.");
        }

        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            System.out.println("🚨 Lỗi: Đơn hàng không có sản phẩm!");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn hàng phải có ít nhất một sản phẩm.");
        }

        Partner partner;
        if (orderDTO.getPartnerId() != null) {
            partner = partnerRepository.findByPartnerName(orderDTO.getPartnerName())
                    .orElseThrow(() -> {
                        System.out.println("🚨 Lỗi: Không tìm thấy khách hàng " + orderDTO.getPartnerName());
                        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khách hàng không tồn tại.");
                    });
        } else {
            System.out.println("✅ Tạo khách hàng mới: " + orderDTO.getPartnerName());
            partner = new Partner();
            partner.setPartnerName(orderDTO.getPartnerName());
            partner = partnerRepository.save(partner);
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

        newOrder.setPartner(partner);

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
