package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryRepository;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.saleOrders.SaleOrdersRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final MaterialsRepository materialRepository;
    private final PartnerRepository partnerRepository;
    private final SaleOrdersRepository saleOrdersRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;
    private final PurchaseRequestDetailMapper purchaseRequestDetailMapper;


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
        // Khởi tạo request chính
        PurchaseRequest purchaseRequest = new PurchaseRequest();
        purchaseRequest.setPurchaseRequestCode(dto.getPurchaseRequestCode());
        purchaseRequest.setNotes(dto.getNotes());
        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);
        purchaseRequest.setRejectionReason(null);
        purchaseRequest.setCreatedDate(LocalDateTime.now());

        // Liên kết với đơn hàng nếu có
        if (dto.getSaleOrderId() != null) {
            SalesOrder salesOrder = saleOrdersRepository.findById(dto.getSaleOrderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
            purchaseRequest.setSalesOrder(salesOrder);
        }

        // Convert list DTO → entity
        List<PurchaseRequestDetail> details = purchaseRequestDetailMapper.toEntityList(dto.getPurchaseRequestDetails());

        // Gán lại quan hệ cho từng detail
        for (int i = 0; i < details.size(); i++) {
            PurchaseRequestDetail detail = details.get(i);
            PurchaseRequestDetailDTO detailDTO = dto.getPurchaseRequestDetails().get(i);

            Material material = materialRepository.findById(detailDTO.getMaterialId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư với ID: " + detailDTO.getMaterialId()));
            Partner partner = partnerRepository.findById(detailDTO.getPartnerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + detailDTO.getPartnerId()));

            detail.setMaterial(material);
            detail.setPartner(partner);
            detail.setPurchaseRequest(purchaseRequest);
        }

        purchaseRequest.setPurchaseRequestDetails(details);

        // ✅ Nếu là từ đơn hàng thì trừ kho sản phẩm
        if (dto.getSaleOrderId() != null && !CollectionUtils.isEmpty(dto.getUsedProductsFromWarehouses())) {
            SalesOrder saleOrder = purchaseRequest.getSalesOrder();
            reserveProductsForSalesOrder(saleOrder, dto.getUsedProductsFromWarehouses());
        }

        // ✅ Trừ luôn cả kho vật tư
        if (!CollectionUtils.isEmpty(dto.getPurchaseRequestDetails())) {
            reserveMaterialsForPurchaseRequest(dto.getPurchaseRequestDetails());
        }

        // Lưu vào DB
        PurchaseRequest saved = purchaseRequestRepository.save(purchaseRequest);

        // Trả về DTO sau khi lưu
        return purchaseRequestMapper.toDTO(saved);
    }



    public void reserveMaterialsForPurchaseRequest(List<PurchaseRequestDetailDTO> detailDTOs) {
        for (PurchaseRequestDetailDTO detailDto : detailDTOs) {
            if (detailDto.getQuantity() <= 0) continue;

            Material material = materialRepository.findById(detailDto.getMaterialId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư với ID: " + detailDto.getMaterialId()));

            double quantityToReserve = detailDto.getQuantity();
            List<Inventory> availableInventories = inventoryRepository.findByMaterialIdAndStatus(
                    material.getMaterialId(), Inventory.InventoryStatus.AVAILABLE);
            availableInventories.sort(Comparator.comparing(Inventory::getInventoryId));

            for (Inventory available : availableInventories) {
                if (quantityToReserve <= 0) break;

                double availableQty = available.getQuantity();
                double toUse = Math.min(availableQty, quantityToReserve);

                available.setQuantity(availableQty - toUse);
                if (available.getQuantity() == 0) {
                    inventoryRepository.delete(available);
                } else {
                    inventoryRepository.save(available);
                }

                Inventory reserved = inventoryRepository.findByMaterial_MaterialIdAndWarehouse_WarehouseIdAndStatus(
                        material.getMaterialId(),
                        available.getWarehouse().getWarehouseId(),
                        Inventory.InventoryStatus.RESERVED
                ).orElseGet(() -> {
                    Inventory newReserved = new Inventory();
                    newReserved.setMaterial(material);
                    newReserved.setWarehouse(available.getWarehouse());
                    newReserved.setStatus(Inventory.InventoryStatus.RESERVED);
                    newReserved.setQuantity(0.0);
                    return newReserved;
                });

                reserved.setQuantity(reserved.getQuantity() + toUse);
                reserved.setLastUpdated(LocalDateTime.now());
                inventoryRepository.save(reserved);

                quantityToReserve -= toUse;
            }
        }
    }

    public void reserveProductsForSalesOrder(SalesOrder salesOrder, List<UsedProductWarehouseDTO> usedProducts) {
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
        request.setStatus(statusEnum);

        if (statusEnum == PurchaseRequest.RequestStatus.CANCELLED) {
            request.setRejectionReason(rejectionReason);
        } else {
            // Với CONFIRMED hoặc các trạng thái khác: chỉ cập nhật rejectionReason
            request.setRejectionReason(null);
        }

        purchaseRequestRepository.save(request);

        // ✅ Xử lý trạng thái đơn hàng liên quan (nếu có)
        if (request.getSalesOrder() != null) {
            SalesOrder salesOrder = request.getSalesOrder();
            List<PurchaseRequest> allRequests = purchaseRequestRepository.findAllBySalesOrder_OrderId(salesOrder.getOrderId());

            boolean allCancelled = allRequests.stream().allMatch(r -> r.getStatus() == PurchaseRequest.RequestStatus.CANCELLED);
            boolean anyConfirmed = allRequests.stream().anyMatch(r -> r.getStatus() == PurchaseRequest.RequestStatus.CONFIRMED);

            if (statusEnum == PurchaseRequest.RequestStatus.CANCELLED && allCancelled) {
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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo mã yêu cầu mới: " + e.getMessage(), e);
        }
    }

//    @Transactional
//    public PurchaseRequestDTO createFromSaleOrder(Long saleOrderId) {
//        if (!canCreatePurchaseRequest(saleOrderId)) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Đơn hàng này đã có yêu cầu mua vật tư đang hoạt động!"
//            );
//        }
//
//        List<ProductMaterialsDTO> materials = productMaterialsService.getMaterialsBySaleOrderId(saleOrderId);
//        logger.info("Materials for SaleOrder {}: {}", saleOrderId, materials);
//        if (materials.isEmpty()) {
//            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư cho đơn hàng với ID: " + saleOrderId);
//        }
//
//        List<PurchaseRequestDetail> details = new ArrayList<>();
//        for (ProductMaterialsDTO materialDTO : materials) {
//            Material material = materialRepository.findById(materialDTO.getMaterialId())
//                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư với ID: " + materialDTO.getMaterialId()));
//            if (material.getUnit() == null) {
//                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vật tư " + materialDTO.getMaterialId() + " không có đơn vị (unit)");
//            }
//            if (material.getMaterialType() == null) {
//                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vật tư " + materialDTO.getMaterialId() + " không có loại vật tư (materialType)");
//            }
//
//            List<Partner> suppliers = partnerRepository.findPartnersByMaterialId(materialDTO.getMaterialId());
//
//            if (suppliers.isEmpty()) {
//                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy nhà cung cấp cho vật tư: " + materialDTO.getMaterialName());
//            }
//
//            PurchaseRequestDetail detail = new PurchaseRequestDetail();
//            detail.setMaterial(material);
//            detail.setQuantity(materialDTO.getQuantity());
//            detail.setPartner(suppliers.get(0));
//            details.add(detail);
//        }
//
//        String purchaseRequestCode = getNextRequestCode();
//
//        PurchaseRequest purchaseRequest = new PurchaseRequest();
//        purchaseRequest.setPurchaseRequestCode(purchaseRequestCode);
//        purchaseRequest.setSalesOrder(saleOrdersRepository.findById(saleOrderId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + saleOrderId)));
//        purchaseRequest.setCreatedDate(LocalDateTime.now());
//        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);
//        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);
//
//        for (PurchaseRequestDetail detail : details) {
//            detail.setPurchaseRequest(purchaseRequest);
//            purchaseRequestDetailRepository.save(detail);
//        }
//        purchaseRequestDetailRepository.flush();
//
//        purchaseRequest = purchaseRequestRepository.findById(purchaseRequest.getPurchaseRequestId())
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu mua vật tư vừa tạo"));
//
//        List<PurchaseRequestDetail> loadedDetails = purchaseRequestDetailRepository.findAllByPurchaseRequest(purchaseRequest);
//        for (PurchaseRequestDetail detail : loadedDetails) {
//            Hibernate.initialize(detail.getMaterial());
//            Hibernate.initialize(detail.getMaterial().getUnit());
//            Hibernate.initialize(detail.getMaterial().getMaterialType());
//            Hibernate.initialize(detail.getPartner());
//        }
//        purchaseRequest.setPurchaseRequestDetails(loadedDetails);
//
//        PurchaseRequestDTO dto = purchaseRequestMapper.toDTO(purchaseRequest);
//        if (dto.getPurchaseRequestDetails() == null) {
//            dto.setPurchaseRequestDetails(new ArrayList<>());
//        }
//
//        return dto;
//    }

    public boolean canCreatePurchaseRequest(Long orderId) {
        List<PurchaseRequest> requests = purchaseRequestRepository.findAllBySalesOrder_OrderId(orderId);
        if (requests.isEmpty()) return true;

        return requests.stream().allMatch(req -> req.getStatus() == PurchaseRequest.RequestStatus.CANCELLED);
    }

}
