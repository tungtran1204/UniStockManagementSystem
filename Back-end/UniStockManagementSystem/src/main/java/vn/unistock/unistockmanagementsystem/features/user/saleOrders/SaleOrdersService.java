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
import vn.unistock.unistockmanagementsystem.features.user.purchaseRequests.PurchaseRequestDetailDTO;
import vn.unistock.unistockmanagementsystem.features.user.purchaseRequests.PurchaseRequestRepository;
import vn.unistock.unistockmanagementsystem.features.user.purchaseRequests.PurchaseRequestService;
import vn.unistock.unistockmanagementsystem.security.filter.CustomUserDetails;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SaleOrdersService {
    private final SaleOrdersRepository saleOrdersRepository;
    private final SaleOrdersMapper saleOrdersMapper;
    private final PartnerRepository partnerRepository;
    private final ProductsRepository productsRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseRequestService purchaseRequestService;

    public SaleOrdersService(SaleOrdersRepository saleOrdersRepository,
                             SaleOrdersMapper saleOrdersMapper,
                             PartnerRepository partnerRepository,
                             ProductsRepository productsRepository,
                             PurchaseRequestRepository purchaseRequestRepository,
                             InventoryRepository inventoryRepository,
                             PurchaseRequestService purchaseRequestService) {
        this.saleOrdersRepository = saleOrdersRepository;
        this.saleOrdersMapper = saleOrdersMapper;
        this.partnerRepository = partnerRepository;
        this.productsRepository = productsRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.inventoryRepository = inventoryRepository;
        this.purchaseRequestService = purchaseRequestService;
    }

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
        Long maxId = saleOrdersRepository.findMaxOrderId();
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

        SalesOrder.OrderStatus orderStatus = saleOrder.getStatus();

        if (orderStatus == SalesOrder.OrderStatus.PROCESSING) {
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
                    dto.setStatusLabel("Yêu cầu đã được duyệt");
                } else if (allCancelled) {
                    dto.setPurchaseRequestStatus("CANCELLED");
                    dto.setStatusLabel("Yêu cầu bị từ chối");
                } else {
                    dto.setPurchaseRequestStatus("PENDING");
                    dto.setStatusLabel("Đang chờ yêu cầu được duyệt");
                }
            }
        } else if (orderStatus == SalesOrder.OrderStatus.PREPARING_MATERIAL) {
            dto.setPurchaseRequestStatus("CONFIRMED");
            dto.setStatusLabel("Đang chuẩn bị vật tư");
        } else if (orderStatus == SalesOrder.OrderStatus.CANCELLED) {
            dto.setPurchaseRequestStatus("CANCELLED");
            dto.setStatusLabel("Đã hủy");
        } else {
            dto.setPurchaseRequestStatus("UNKNOWN");
            dto.setStatusLabel("Không rõ trạng thái");
        }
    }

    @Transactional
    public void cancelSalesOrder(Long orderId, String rejectionReason) {
        SalesOrder order = saleOrdersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus(SalesOrder.OrderStatus.CANCELLED);
        order.setRejectionReason(rejectionReason);

        // Release RESERVED inventory for products
        List<SalesOrderDetail> details = order.getDetails();
        for (SalesOrderDetail detail : details) {
            Product product = detail.getProduct();
            double quantityToRelease = detail.getQuantity();

            // Fetch all RESERVED inventory for this product
            List<Inventory> reservedInventories = inventoryRepository.findByProductIdAndStatus(
                    product.getProductId(), Inventory.InventoryStatus.RESERVED);

            // Group quantities by warehouse
            Map<Long, Double> warehouseQuantities = new HashMap<>();
            for (Inventory inventory : reservedInventories) {
                if (quantityToRelease <= 0) break;

                double quantityInInventory = inventory.getQuantity();
                double quantityToReleaseFromThis = Math.min(quantityInInventory, quantityToRelease);

                Long warehouseId = inventory.getWarehouse().getWarehouseId();
                warehouseQuantities.merge(warehouseId, quantityToReleaseFromThis, Double::sum);

                quantityToRelease -= quantityToReleaseFromThis;
            }

            // Consolidate inventory for each warehouse
            for (Map.Entry<Long, Double> entry : warehouseQuantities.entrySet()) {
                Long warehouseId = entry.getKey();
                double releasedQuantity = entry.getValue();

                Warehouse warehouse = reservedInventories.stream()
                        .filter(inv -> inv.getWarehouse().getWarehouseId().equals(warehouseId))
                        .findFirst()
                        .map(Inventory::getWarehouse)
                        .orElseThrow(() -> new RuntimeException("Warehouse not found for warehouseId: " + warehouseId));

                // Find or create AVAILABLE inventory
                Inventory availableInventory = inventoryRepository.findByWarehouseAndProductAndStatus(
                                warehouse, product, Inventory.InventoryStatus.AVAILABLE)
                        .orElse(null);

                if (availableInventory == null) {
                    availableInventory = Inventory.builder()
                            .warehouse(warehouse)
                            .product(product)
                            .status(Inventory.InventoryStatus.AVAILABLE)
                            .quantity(0.0)
                            .build();
                }
                availableInventory.setQuantity(availableInventory.getQuantity() + releasedQuantity);
                availableInventory.setLastUpdated(LocalDateTime.now());
                availableInventory.setSalesOrder(null);
                inventoryRepository.save(availableInventory);

                // Delete RESERVED records for this warehouse
                List<Inventory> reservedToDelete = reservedInventories.stream()
                        .filter(inv -> inv.getWarehouse().getWarehouseId().equals(warehouseId))
                        .toList();
                inventoryRepository.deleteAll(reservedToDelete);
            }

            if (quantityToRelease > 0) {
                // Log warning if insufficient RESERVED inventory
                System.err.println("Insufficient RESERVED inventory for productId " + product.getProductId() +
                        ": " + quantityToRelease + " units remaining");
            }
        }

        // Release RESERVED inventory for materials
        List<PurchaseRequest> requests = purchaseRequestRepository.findAllBySalesOrder_OrderId(orderId);
        for (PurchaseRequest pr : requests) {
            pr.setStatus(PurchaseRequest.RequestStatus.CANCELLED);
            pr.setRejectionReason("Đơn hàng đã bị hủy");

            List<PurchaseRequestDetail> prDetails = pr.getPurchaseRequestDetails();
            for (PurchaseRequestDetail detail : prDetails) {
                Material material = detail.getMaterial();
                double quantityToRelease = detail.getQuantity();

                // Fetch all RESERVED inventory for this material
                List<Inventory> reservedInventories = inventoryRepository.findByMaterialIdAndStatus(
                        material.getMaterialId(), Inventory.InventoryStatus.RESERVED);

                // Group quantities by warehouse
                Map<Long, Double> warehouseQuantities = new HashMap<>();
                for (Inventory inventory : reservedInventories) {
                    if (quantityToRelease <= 0) break;

                    double quantityInInventory = inventory.getQuantity();
                    double quantityToReleaseFromThis = Math.min(quantityInInventory, quantityToRelease);

                    Long warehouseId = inventory.getWarehouse().getWarehouseId();
                    warehouseQuantities.merge(warehouseId, quantityToReleaseFromThis, Double::sum);

                    quantityToRelease -= quantityToReleaseFromThis;
                }

                // Consolidate inventory for each warehouse
                for (Map.Entry<Long, Double> entry : warehouseQuantities.entrySet()) {
                    Long warehouseId = entry.getKey();
                    double releasedQuantity = entry.getValue();

                    Warehouse warehouse = reservedInventories.stream()
                            .filter(inv -> inv.getWarehouse().getWarehouseId().equals(warehouseId))
                            .findFirst()
                            .map(Inventory::getWarehouse)
                            .orElseThrow(() -> new RuntimeException("Warehouse not found for warehouseId: " + warehouseId));

                    // Find or create AVAILABLE inventory
                    Inventory availableInventory = inventoryRepository.findByWarehouseAndMaterialAndStatus(
                                    warehouse, material, Inventory.InventoryStatus.AVAILABLE)
                            .orElse(null);

                    if (availableInventory == null) {
                        availableInventory = Inventory.builder()
                                .warehouse(warehouse)
                                .material(material)
                                .status(Inventory.InventoryStatus.AVAILABLE)
                                .quantity(0.0)
                                .build();
                    }
                    availableInventory.setQuantity(availableInventory.getQuantity() + releasedQuantity);
                    availableInventory.setLastUpdated(LocalDateTime.now());
                    availableInventory.setSalesOrder(null);
                    inventoryRepository.save(availableInventory);

                    // Delete RESERVED records for this warehouse
                    List<Inventory> reservedToDelete = reservedInventories.stream()
                            .filter(inv -> inv.getWarehouse().getWarehouseId().equals(warehouseId))
                            .toList();
                    inventoryRepository.deleteAll(reservedToDelete);
                }

                if (quantityToRelease > 0) {
                    // Log warning if insufficient RESERVED inventory
                    System.err.println("Insufficient RESERVED inventory for materialId " + material.getMaterialId() +
                            ": " + quantityToRelease + " units remaining");
                }
            }

            purchaseRequestRepository.save(pr);
        }

        saleOrdersRepository.save(order);
    }

    @Transactional
    public SaleOrdersDTO createSaleOrder(SaleOrdersDTO saleOrdersDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User currentUser = userDetails.getUser();

        Partner partner = partnerRepository.findByPartnerCode(saleOrdersDTO.getPartnerCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Partner not found with code: " + saleOrdersDTO.getPartnerCode()));

        if (saleOrdersDTO.getOrderDetails() != null) {
            saleOrdersDTO.getOrderDetails().forEach(detailDTO -> {
                Product product = productsRepository.findByProductCode(detailDTO.getProductCode())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Product not found with code: " + detailDTO.getProductCode()));
                detailDTO.setProductId(product.getProductId());
            });
        }

        SalesOrder order = saleOrdersMapper.toEntity(saleOrdersDTO);
        order.setPartner(partner);
        order.setCreatedByUser(currentUser);

        if (order.getStatus() == null) {
            order.setStatus(SalesOrder.OrderStatus.PROCESSING);
        }

        if (order.getDetails() != null) {
            order.getDetails().forEach(detail -> {
                detail.setSalesOrder(order);
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
    public void setPreparingMaterialStatus(PrepareMaterialForSaleOrderDTO request) {
        SalesOrder order = saleOrdersRepository.findById(request.getSaleOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus(SalesOrder.OrderStatus.PREPARING_MATERIAL);

        if (request.getUsedProductsFromWarehouses() != null && !request.getUsedProductsFromWarehouses().isEmpty()) {
            purchaseRequestService.reserveProductsForSalesOrder(order, request.getUsedProductsFromWarehouses());
        }

        if (request.getUsedMaterialsFromWarehouses() != null && !request.getUsedMaterialsFromWarehouses().isEmpty()) {
            List<PurchaseRequestDetailDTO> materialReserveList = request.getUsedMaterialsFromWarehouses().stream()
                    .filter(m -> m.getQuantity() > 0)
                    .map(m -> {
                        PurchaseRequestDetailDTO dto = new PurchaseRequestDetailDTO();
                        dto.setMaterialId(m.getMaterialId());
                        dto.setQuantity((int) m.getQuantity());
                        return dto;
                    })
                    .toList();

            purchaseRequestService.reserveMaterialsForPurchaseRequest(materialReserveList, order);
        }

        saleOrdersRepository.save(order);
    }
}