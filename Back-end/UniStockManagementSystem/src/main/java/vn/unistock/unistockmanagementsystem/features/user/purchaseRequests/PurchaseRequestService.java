package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryRepository;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsDTO;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsService;
import vn.unistock.unistockmanagementsystem.features.user.saleOrders.SaleOrdersRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private static final Logger logger = LoggerFactory.getLogger(PurchaseRequestService.class);

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final MaterialsRepository materialRepository;
    private final PurchaseRequestDetailRepository purchaseRequestDetailRepository;
    private final PartnerRepository partnerRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;
    private final PurchaseRequestDetailMapper purchaseRequestDetailMapper;
    private final SaleOrdersRepository saleOrdersRepository;
    private final ProductMaterialsService productMaterialsService;
    private final InventoryRepository inventoryRepository;

    public Page<PurchaseRequestDTO> getAllPurchaseRequests(Pageable pageable) {
        Page<PurchaseRequest> page = purchaseRequestRepository.findAll(pageable);
        return page.map(purchaseRequestMapper::toDTO);
    }



    public PurchaseRequestDTO getPurchaseRequestById(Long id) {
        PurchaseRequest purchaseRequest = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu mua vật tư với id: " + id));

        Hibernate.initialize(purchaseRequest.getPurchaseRequestDetails());
        for (PurchaseRequestDetail detail : purchaseRequest.getPurchaseRequestDetails()) {
            Hibernate.initialize(detail.getMaterial());
            Hibernate.initialize(detail.getMaterial().getUnit());
            Hibernate.initialize(detail.getPartner());
        }

        return purchaseRequestMapper.toDTO(purchaseRequest);
    }

    @Transactional
    public PurchaseRequestDTO createManualPurchaseRequest(PurchaseRequestDTO dto) {
        logger.info("Bắt đầu tạo PurchaseRequest: {}", dto);
        PurchaseRequest purchaseRequest = purchaseRequestMapper.toEntity(dto);
        purchaseRequest.setCreatedDate(LocalDateTime.now());
        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);

        SalesOrder salesOrder = null;
        List<UsedProductWarehouseDTO> usedProducts = dto.getUsedProductsFromWarehouses();

        if (dto.getSaleOrderId() != null) {
            salesOrder = saleOrdersRepository.findById(dto.getSaleOrderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + dto.getSaleOrderId()));
            purchaseRequest.setSalesOrder(salesOrder);
        }

        List<PurchaseRequestDetail> details = new ArrayList<>();
        for (PurchaseRequestDetailDTO detailDto : dto.getPurchaseRequestDetails()) {
            PurchaseRequestDetail detail = purchaseRequestDetailMapper.toEntity(detailDto);
            Material material = materialRepository.findById(detailDto.getMaterialId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư với ID: " + detailDto.getMaterialId()));
            Partner partner = partnerRepository.findById(detailDto.getPartnerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + detailDto.getPartnerId()));

            Double availableQuantity = inventoryRepository.sumQuantityByMaterialIdAndStatus(material.getMaterialId(), Inventory.InventoryStatus.AVAILABLE);

            double requiredQuantity = detailDto.getQuantity();
            double quantityToBuy = 0.0;
            if (availableQuantity == null || availableQuantity < requiredQuantity) {
                quantityToBuy = requiredQuantity - (availableQuantity != null ? availableQuantity : 0.0);
            }

            if (availableQuantity != null && availableQuantity > 0) {
                List<Inventory> availableInventories = inventoryRepository.findByMaterialIdAndStatus(material.getMaterialId(), Inventory.InventoryStatus.AVAILABLE);
                for (Inventory inventory : availableInventories) {
                    if (requiredQuantity <= 0) break;

                    double availableQty = inventory.getQuantity();
                    double toUse = Math.min(availableQty, requiredQuantity);
                    inventory.setQuantity(availableQty - toUse);

                    if (inventory.getQuantity() == 0) {
                        inventoryRepository.delete(inventory);
                    } else {
                        inventoryRepository.save(inventory);
                    }

                    // tìm hoặc tạo bản ghi RESERVED tương ứng
                    Inventory reserved = inventoryRepository
                            .findByMaterial_MaterialIdAndWarehouse_WarehouseIdAndStatus(
                                    material.getMaterialId(),
                                    inventory.getWarehouse().getWarehouseId(),
                                    Inventory.InventoryStatus.RESERVED
                            )
                            .orElseGet(() -> {
                                Inventory newReserved = new Inventory();
                                newReserved.setMaterial(material);
                                newReserved.setWarehouse(inventory.getWarehouse());
                                newReserved.setStatus(Inventory.InventoryStatus.RESERVED);
                                newReserved.setQuantity(0.0);
                                return newReserved;
                            });

                    reserved.setQuantity(reserved.getQuantity() + toUse);
                    reserved.setLastUpdated(LocalDateTime.now());
                    inventoryRepository.save(reserved);

                    requiredQuantity -= toUse;
                }
            }

            if (quantityToBuy <= 0) continue;

            detail.setQuantity((int) quantityToBuy);
            detail.setMaterial(material);
            detail.setPartner(partner);
            detail.setPurchaseRequest(purchaseRequest);
            details.add(detail);
        }

        if (details.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không có vật tư nào cần mua!");
        }

        purchaseRequest.setPurchaseRequestDetails(details);
        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);

        if (salesOrder != null) {
            reserveProductsForSalesOrder(salesOrder, usedProducts);
            salesOrder.setStatus(SalesOrder.OrderStatus.PREPARING_MATERIAL);
            saleOrdersRepository.save(salesOrder);
        }

        PurchaseRequestDTO responseDTO = purchaseRequestMapper.toDTO(purchaseRequest);
        responseDTO.setPurchaseRequestDetails(purchaseRequestDetailMapper.toDTOList(details));
        return responseDTO;
    }

    private void reserveProductsForSalesOrder(SalesOrder salesOrder, List<UsedProductWarehouseDTO> usedProducts) {
        if (usedProducts == null || usedProducts.isEmpty()) return;

        for (UsedProductWarehouseDTO entry : usedProducts) {
            Long productId = entry.getProductId();
            Long warehouseId = entry.getWarehouseId();
            double requiredQuantity = entry.getQuantity();

            List<Inventory> availableInventories = inventoryRepository.findByProductIdAndStatus(productId, Inventory.InventoryStatus.AVAILABLE)
                    .stream()
                    .filter(inv -> inv.getWarehouse().getWarehouseId().equals(warehouseId))
                    .sorted(Comparator.comparing(Inventory::getInventoryId))
                    .collect(Collectors.toList());

            for (Inventory inventory : availableInventories) {
                if (requiredQuantity <= 0) break;

                double availableQty = inventory.getQuantity();
                double toUse = Math.min(availableQty, requiredQuantity);

                inventory.setQuantity(availableQty - toUse);
                if (inventory.getQuantity() == 0) {
                    inventoryRepository.delete(inventory);
                } else {
                    inventoryRepository.save(inventory);
                }

                Inventory reserved = inventoryRepository
                        .findByProduct_ProductIdAndWarehouse_WarehouseIdAndStatus(
                                productId,
                                warehouseId,
                                Inventory.InventoryStatus.RESERVED
                        )
                        .orElseGet(() -> {
                            Inventory newReserved = new Inventory();
                            newReserved.setProduct(inventory.getProduct());
                            newReserved.setWarehouse(inventory.getWarehouse());
                            newReserved.setStatus(Inventory.InventoryStatus.RESERVED);
                            newReserved.setQuantity(0.0);
                            return newReserved;
                        });

                reserved.setQuantity(reserved.getQuantity() + toUse);
                reserved.setLastUpdated(LocalDateTime.now());
                inventoryRepository.save(reserved);

                requiredQuantity -= toUse;
            }

            if (requiredQuantity > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đủ số lượng tại kho " + warehouseId + " cho sản phẩm " + productId);
            }
        }
    }



    @Transactional
    public PurchaseRequestDTO updatePurchaseRequestStatus(Long id, String status, String rejectionReason) {
        PurchaseRequest request = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu mua vật tư với ID: " + id));

        PurchaseRequest.RequestStatus statusEnum = PurchaseRequest.RequestStatus.valueOf(status);
        PurchaseRequest.RequestStatus oldStatus = request.getStatus();
        request.setStatus(statusEnum);

        if (statusEnum == PurchaseRequest.RequestStatus.CANCELLED) {
            request.setRejectionReason(rejectionReason);

            // Trả trạng thái RESERVED về AVAILABLE cho vật tư
            List<PurchaseRequestDetail> details = request.getPurchaseRequestDetails();
            for (PurchaseRequestDetail detail : details) {
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
        } else {
            request.setRejectionReason(null);
        }

        purchaseRequestRepository.save(request);

        // Nếu yêu cầu này liên kết với đơn hàng, cập nhật trạng thái đơn hàng và sản phẩm
        if (request.getSalesOrder() != null) {
            SalesOrder salesOrder = request.getSalesOrder();
            List<PurchaseRequest> allRequests = purchaseRequestRepository.findAllBySalesOrder_OrderId(salesOrder.getOrderId());

            boolean allCancelled = allRequests.stream().allMatch(r -> r.getStatus() == PurchaseRequest.RequestStatus.CANCELLED);
            boolean anyConfirmed = allRequests.stream().anyMatch(r -> r.getStatus() == PurchaseRequest.RequestStatus.CONFIRMED);

            if (statusEnum == PurchaseRequest.RequestStatus.CANCELLED && allCancelled) {
                // Trả trạng thái RESERVED về AVAILABLE cho sản phẩm
                List<SalesOrderDetail> details = salesOrder.getDetails();
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

                // Cập nhật trạng thái SalesOrder
                salesOrder.setStatus(SalesOrder.OrderStatus.PROCESSING);
            } else if (statusEnum == PurchaseRequest.RequestStatus.CONFIRMED || anyConfirmed) {
                salesOrder.setStatus(SalesOrder.OrderStatus.PREPARING_MATERIAL);
            }

            saleOrdersRepository.save(salesOrder);
        }

        return purchaseRequestMapper.toDTO(request);
    }



    @Transactional
    public String getNextRequestCode() {
        try {
            Long maxId = purchaseRequestRepository.findMaxPurchaseRequestId();
            Long nextId = (maxId != null) ? (maxId + 1) : 1;
            return String.format("YC%05d", nextId);
        } catch (Exception e) {
            logger.error("Error generating next request code", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo mã yêu cầu mới: " + e.getMessage(), e);
        }
    }

    @Transactional
    public PurchaseRequestDTO createFromSaleOrder(Long saleOrderId) {
        if (!canCreatePurchaseRequest(saleOrderId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn hàng này đã có yêu cầu mua vật tư đang hoạt động!"
            );
        }

        List<ProductMaterialsDTO> materials = productMaterialsService.getMaterialsBySaleOrderId(saleOrderId);
        logger.info("Materials for SaleOrder {}: {}", saleOrderId, materials);
        if (materials.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư cho đơn hàng với ID: " + saleOrderId);
        }

        List<PurchaseRequestDetail> details = new ArrayList<>();
        for (ProductMaterialsDTO materialDTO : materials) {
            Material material = materialRepository.findById(materialDTO.getMaterialId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư với ID: " + materialDTO.getMaterialId()));
            if (material.getUnit() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vật tư " + materialDTO.getMaterialId() + " không có đơn vị (unit)");
            }
            if (material.getMaterialType() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vật tư " + materialDTO.getMaterialId() + " không có loại vật tư (materialType)");
            }

            List<Partner> suppliers = partnerRepository.findPartnersByMaterialId(materialDTO.getMaterialId());

            if (suppliers.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy nhà cung cấp cho vật tư: " + materialDTO.getMaterialName());
            }

            PurchaseRequestDetail detail = new PurchaseRequestDetail();
            detail.setMaterial(material);
            detail.setQuantity(materialDTO.getQuantity());
            detail.setPartner(suppliers.get(0));
            details.add(detail);
        }

        String purchaseRequestCode = getNextRequestCode();

        PurchaseRequest purchaseRequest = new PurchaseRequest();
        purchaseRequest.setPurchaseRequestCode(purchaseRequestCode);
        purchaseRequest.setSalesOrder(saleOrdersRepository.findById(saleOrderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + saleOrderId)));
        purchaseRequest.setCreatedDate(LocalDateTime.now());
        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);
        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);

        for (PurchaseRequestDetail detail : details) {
            detail.setPurchaseRequest(purchaseRequest);
            purchaseRequestDetailRepository.save(detail);
        }
        purchaseRequestDetailRepository.flush();

        purchaseRequest = purchaseRequestRepository.findById(purchaseRequest.getPurchaseRequestId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu mua vật tư vừa tạo"));

        List<PurchaseRequestDetail> loadedDetails = purchaseRequestDetailRepository.findAllByPurchaseRequest(purchaseRequest);
        for (PurchaseRequestDetail detail : loadedDetails) {
            Hibernate.initialize(detail.getMaterial());
            Hibernate.initialize(detail.getMaterial().getUnit());
            Hibernate.initialize(detail.getMaterial().getMaterialType());
            Hibernate.initialize(detail.getPartner());
        }
        purchaseRequest.setPurchaseRequestDetails(loadedDetails);

        PurchaseRequestDTO dto = purchaseRequestMapper.toDTO(purchaseRequest);
        if (dto.getPurchaseRequestDetails() == null) {
            dto.setPurchaseRequestDetails(new ArrayList<>());
        }

        return dto;
    }

    public boolean canCreatePurchaseRequest(Long orderId) {
        List<PurchaseRequest> requests = purchaseRequestRepository.findAllBySalesOrder_OrderId(orderId);
        if (requests.isEmpty()) return true;

        return requests.stream().allMatch(req -> req.getStatus() == PurchaseRequest.RequestStatus.CANCELLED);
    }

}
