package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryRepository;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;
import vn.unistock.unistockmanagementsystem.features.user.purchaseOrder.PurchaseOrderRepository;
import vn.unistock.unistockmanagementsystem.features.user.purchaseRequests.PurchaseRequestRepository;
import vn.unistock.unistockmanagementsystem.security.filter.CustomUserDetails;

import java.util.List;

@Service
public class SaleOrdersService {
    private final SaleOrdersRepository saleOrdersRepository;
    private final SaleOrdersMapper saleOrdersMapper;
    private final PartnerRepository partnerRepository;
    private final ProductsRepository productsRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final InventoryRepository inventoryRepository;

    public SaleOrdersService(SaleOrdersRepository saleOrdersRepository,
                             SaleOrdersMapper saleOrdersMapper,
                             PartnerRepository partnerRepository,
                             ProductsRepository productsRepository, PurchaseRequestRepository purchaseRequestRepository, InventoryRepository inventoryRepository) {
        this.saleOrdersRepository = saleOrdersRepository;
        this.saleOrdersMapper = saleOrdersMapper;
        this.partnerRepository = partnerRepository;
        this.productsRepository = productsRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Lấy danh sách tất cả đơn hàng
     */
    public Page<SaleOrdersDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SalesOrder> salesOrderPage = saleOrdersRepository.findAll(pageable);
        return salesOrderPage.map(saleOrder -> {
            SaleOrdersDTO dto = saleOrdersMapper.toDTO(saleOrder);
            enrichStatusLabel(dto, saleOrder);
            return dto;
        });
    }


    public String getNextOrderCode() {
        Long maxId = saleOrdersRepository.findMaxOrderId(); // SELECT MAX(order_id)
        Long nextId = (maxId != null ? maxId : 0L) + 1;
        return String.format("ĐH%05d", nextId);
    }

    public SaleOrdersDTO getOrderById(Long orderId) {
        SalesOrder saleOrder = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        SaleOrdersDTO dto = saleOrdersMapper.toDTO(saleOrder);
        enrichStatusLabel(dto, saleOrder);
        return dto;
    }

    private void enrichStatusLabel(SaleOrdersDTO dto, SalesOrder saleOrder) {
        List<PurchaseRequest> requests = purchaseRequestRepository.findAllBySalesOrder_OrderId(saleOrder.getOrderId());

        // Trạng thái chính của đơn hàng
        SalesOrder.OrderStatus orderStatus = saleOrder.getStatus();

        if (orderStatus == SalesOrder.OrderStatus.PROCESSING) {
            // ✅ Mặc định là "Đang xử lý"
            if (requests.isEmpty()) {
                dto.setPurchaseRequestStatus("NONE");
                dto.setStatusLabel("Chưa có yêu cầu");
            } else {
                boolean allCancelled = requests.stream()
                        .allMatch(r -> r.getStatus() == PurchaseRequest.RequestStatus.CANCELLED);
                boolean anyConfirmed = requests.stream()
                        .anyMatch(r -> r.getStatus() == PurchaseRequest.RequestStatus.CONFIRMED);

                if (anyConfirmed) {
                    dto.setPurchaseRequestStatus("CONFIRMED");
                    dto.setStatusLabel("Yêu cầu đã được duyệt");
                } else if (allCancelled) {
                    dto.setPurchaseRequestStatus("CANCELLED");
                    dto.setStatusLabel("Yêu cầu bị từ chối");
                } else {
                    dto.setPurchaseRequestStatus("PENDING");
                    dto.setStatusLabel("Đang chờ yêu cầu được duyệt");
                }
            }
        } else if (orderStatus == SalesOrder.OrderStatus.PREPARING_MATERIAL) {
            dto.setPurchaseRequestStatus("CONFIRMED");
            dto.setStatusLabel("Đang chuẩn bị vật tư");
        } else if (orderStatus == SalesOrder.OrderStatus.CANCELLED) {
            dto.setPurchaseRequestStatus("CANCELLED");
            dto.setStatusLabel("Đã huỷ");
        } else {
            // Trường hợp chưa xác định rõ
            dto.setPurchaseRequestStatus("UNKNOWN");
            dto.setStatusLabel("Không rõ trạng thái");
        }
    }

    @Transactional
    public void cancelSalesOrder(Long orderId, String rejectionReason) {
        SalesOrder order = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Cập nhật trạng thái & lý do hủy đơn hàng
        order.setStatus(SalesOrder.OrderStatus.CANCELLED);
        order.setRejectionReason(rejectionReason);

        // Trả trạng thái RESERVED về AVAILABLE cho sản phẩm
        List<SalesOrderDetail> details = order.getDetails();
        for (SalesOrderDetail detail : details) {
            Product product = detail.getProduct();
            double quantityToRelease = detail.getQuantity();

            List<Inventory> reservedInventories = inventoryRepository.findByProductIdAndStatus(product.getProductId(), Inventory.InventoryStatus.RESERVED);
            for (Inventory inventory : reservedInventories) {
                if (quantityToRelease <= 0) break;

                double quantityInInventory = inventory.getQuantity();
                double quantityToReleaseFromThis = Math.min(quantityInInventory, quantityToRelease);

                // Cập nhật trạng thái về AVAILABLE
                inventory.setStatus(Inventory.InventoryStatus.AVAILABLE);
                inventoryRepository.save(inventory);

                quantityToRelease -= quantityToReleaseFromThis;
            }
        }

        saleOrdersRepository.save(order);

        // Tìm và hủy tất cả yêu cầu mua vật tư liên quan
        List<PurchaseRequest> requests = purchaseRequestRepository.findAllBySalesOrder_OrderId(orderId);
        for (PurchaseRequest pr : requests) {
            pr.setStatus(PurchaseRequest.RequestStatus.CANCELLED);
            pr.setRejectionReason("Đơn hàng đã bị hủy");

            // Trả trạng thái RESERVED về AVAILABLE cho vật tư
            List<PurchaseRequestDetail> prDetails = pr.getPurchaseRequestDetails();
            for (PurchaseRequestDetail detail : prDetails) {
                Material material = detail.getMaterial();
                double quantityToRelease = detail.getQuantity();

                List<Inventory> reservedInventories = inventoryRepository.findByMaterialIdAndStatus(material.getMaterialId(), Inventory.InventoryStatus.RESERVED);
                for (Inventory inventory : reservedInventories) {
                    if (quantityToRelease <= 0) break;

                    double quantityInInventory = inventory.getQuantity();
                    double quantityToReleaseFromThis = Math.min(quantityInInventory, quantityToRelease);

                    // Cập nhật trạng thái về AVAILABLE
                    inventory.setStatus(Inventory.InventoryStatus.AVAILABLE);
                    inventoryRepository.save(inventory);

                    quantityToRelease -= quantityToReleaseFromThis;
                }
            }

            purchaseRequestRepository.save(pr);
        }
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

        // Set mặc định status nếu chưa có
        if (order.getStatus() == null) {
            order.setStatus(SalesOrder.OrderStatus.PROCESSING);
        }

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


    public SaleOrdersDTO updateSaleOrder(Long orderId, SaleOrdersDTO saleOrdersDTO) {
        SalesOrder existingOrder = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        Partner partner = partnerRepository.findByPartnerCode(saleOrdersDTO.getPartnerCode())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy Partner với code: " + saleOrdersDTO.getPartnerCode()
                ));

        partner.setPartnerName(saleOrdersDTO.getPartnerName());
        partner.setAddress(saleOrdersDTO.getAddress());
        partner.setPhone(saleOrdersDTO.getPhoneNumber());
        partner.setContactName(saleOrdersDTO.getContactName());

        SalesOrder newOrderData = saleOrdersMapper.toEntity(saleOrdersDTO);
        newOrderData.setPartner(partner);
        newOrderData.setOrderId(existingOrder.getOrderId());

        // Set mặc định status nếu DTO không truyền lên
        if (newOrderData.getStatus() == null) {
            newOrderData.setStatus(existingOrder.getStatus());
        }

        if (newOrderData.getDetails() != null) {
            for (SalesOrderDetail detail : newOrderData.getDetails()) {
                detail.setSalesOrder(newOrderData);
            }
        }
        newOrderData.setCreatedByUser(existingOrder.getCreatedByUser());
        newOrderData.setCreatedAt(existingOrder.getCreatedAt());

        SalesOrder savedOrder = saleOrdersRepository.save(newOrderData);

        return saleOrdersMapper.toDTO(savedOrder);
    }

    @Transactional
    public void setPreparingMaterialStatus(Long orderId) {
        SalesOrder order = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus(SalesOrder.OrderStatus.PREPARING_MATERIAL);
        saleOrdersRepository.save(order);
    }


}
