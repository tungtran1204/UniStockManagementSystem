package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.Partner;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;
import vn.unistock.unistockmanagementsystem.security.filter.CustomUserDetails;

@Service
public class SaleOrdersService {
    private final SaleOrdersRepository saleOrdersRepository;
    private final SaleOrdersMapper saleOrdersMapper;
    private final PartnerRepository partnerRepository;
    private final ProductsRepository productsRepository;

    public SaleOrdersService(SaleOrdersRepository saleOrdersRepository,
                             SaleOrdersMapper saleOrdersMapper,
                             PartnerRepository partnerRepository,
                             ProductsRepository productsRepository) {
        this.saleOrdersRepository = saleOrdersRepository;
        this.saleOrdersMapper = saleOrdersMapper;
        this.partnerRepository = partnerRepository;
        this.productsRepository = productsRepository;
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

    @Transactional
    public SaleOrdersDTO createSaleOrder(SaleOrdersDTO saleOrdersDTO) {
        // Lấy user hiện tại từ SecurityContextHolder
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User currentUser = userDetails.getUser();

        // Tìm đối tượng Partner theo partnerCode từ DTO
        Partner partner = partnerRepository.findByPartnerCode(saleOrdersDTO.getPartnerCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Partner not found with code: " + saleOrdersDTO.getPartnerCode()));

        // Với mỗi chi tiết đơn hàng, tra cứu Product theo productCode và set productId vào DTO
        if (saleOrdersDTO.getOrderDetails() != null) {
            saleOrdersDTO.getOrderDetails().forEach(detailDTO -> {
                Product product = productsRepository.findByProductCode(detailDTO.getProductCode())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Product not found with code: " + detailDTO.getProductCode()));
                detailDTO.setProductId(product.getProductId());
            });
        }

        // Chuyển SaleOrdersDTO sang entity SalesOrder qua mapper
        SalesOrder order = saleOrdersMapper.toEntity(saleOrdersDTO);
        order.setPartner(partner);
        order.setCreatedByUser(currentUser);

        // Đảm bảo mỗi SalesOrderDetail có salesOrder được set và thay thế Product transient bằng persistent
        if (order.getDetails() != null) {
            order.getDetails().forEach(detail -> {
                detail.setSalesOrder(order); // Thiết lập back-reference
                Long prodId = detail.getProduct().getProductId();
                Product persistentProduct = productsRepository.getReferenceById(prodId);
                detail.setProduct(persistentProduct);
            });
        }

        SalesOrder savedOrder = saleOrdersRepository.save(order);
        return saleOrdersMapper.toDTO(savedOrder);
    }


}
