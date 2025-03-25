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
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.partner.PartnerRepository;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsDTO;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsService;
import vn.unistock.unistockmanagementsystem.features.user.saleOrders.SaleOrdersRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    private final SaleOrdersMapper saleOrdersMapper;

    public Page<PurchaseRequestDTO> getAllPurchaseRequests(Pageable pageable) {
        Page<PurchaseRequest> requests = purchaseRequestRepository.findAll(pageable);
        return requests.map(purchaseRequestMapper::toDTO);
    }

    public PurchaseRequestDTO getPurchaseRequestById(Long id) {
        PurchaseRequest purchaseRequest = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu mua vật tư với id: " + id));

        // Tải purchaseRequestDetails và các liên kết liên quan
        Hibernate.initialize(purchaseRequest.getPurchaseRequestDetails());
        for (PurchaseRequestDetail detail : purchaseRequest.getPurchaseRequestDetails()) {
            Hibernate.initialize(detail.getMaterial());
            Hibernate.initialize(detail.getMaterial().getUnit());
            Hibernate.initialize(detail.getPartner());
        }

        // Sử dụng mapper để ánh xạ
        PurchaseRequestDTO dto = purchaseRequestMapper.toDTO(purchaseRequest);
        return dto;
    }

    @Transactional
    public PurchaseRequestDTO createManualPurchaseRequest(PurchaseRequestDTO dto) {
        // Chuyển đổi DTO → Entity
        PurchaseRequest purchaseRequest = purchaseRequestMapper.toEntity(dto);
        purchaseRequest.setCreatedDate(LocalDateTime.now());
        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);

        if (dto.getSaleOrderId() != null) {
            SalesOrder salesOrder = saleOrdersRepository.findById(dto.getSaleOrderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + dto.getSaleOrderId()));
            purchaseRequest.setSalesOrder(salesOrder);
        }

        // Tạo danh sách details
        List<PurchaseRequestDetail> details = new ArrayList<>();
        for (PurchaseRequestDetailDTO detailDto : dto.getPurchaseRequestDetails()) {
            PurchaseRequestDetail detail = purchaseRequestDetailMapper.toEntity(detailDto);
            Material material = materialRepository.findById(detailDto.getMaterialId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư với ID: " + detailDto.getMaterialId()));
            Partner partner = partnerRepository.findById(detailDto.getPartnerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + detailDto.getPartnerId()));

            detail.setMaterial(material);
            detail.setPartner(partner);
            detail.setPurchaseRequest(purchaseRequest);
            details.add(detail);
        }

        purchaseRequest.setPurchaseRequestDetails(details);

        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);

        // Chuyển đổi lại Entity → DTO để trả về
        PurchaseRequestDTO responseDTO = purchaseRequestMapper.toDTO(purchaseRequest);
        responseDTO.setPurchaseRequestDetails(purchaseRequestDetailMapper.toDTOList(details));

        return responseDTO;
    }

    @Transactional
    public PurchaseRequestDTO updatePurchaseRequestStatus(Long purchaseRequestId, String newStatus) {
        PurchaseRequest request = purchaseRequestRepository.findById(purchaseRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu với ID: " + purchaseRequestId));

        // Chuyển đổi String thành Enum RequestStatus
        PurchaseRequest.RequestStatus statusEnum;
        try {
            statusEnum = PurchaseRequest.RequestStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ: " + newStatus);
        }

        request.setStatus(statusEnum);
        PurchaseRequest updatedRequest = purchaseRequestRepository.save(request);

        return purchaseRequestMapper.toDTO(updatedRequest);
    }

    @Transactional
    public String getNextRequestCode() {
        try {
            Long maxId = purchaseRequestRepository.findMaxPurchaseRequestId();
            Long nextId = (maxId != null) ? (maxId + 1) : 1; // Nếu DB trống, bắt đầu từ 1
            return String.format("YC%05d", nextId);
        } catch (Exception e) {
            logger.error("Error generating next request code", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo mã yêu cầu mới: " + e.getMessage(), e);
        }
    }

    @Transactional
    public PurchaseRequestDTO createFromSaleOrder(Long saleOrderId) {
        if (purchaseRequestRepository.existsBySalesOrder_OrderId(saleOrderId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn hàng này đã có yêu cầu mua vật tư!"
            );
        }
        // 🟢 1. Lấy danh sách vật tư từ đơn hàng
        List<ProductMaterialsDTO> materials = productMaterialsService.getMaterialsBySaleOrderId(saleOrderId);
        logger.info("Materials for SaleOrder {}: {}", saleOrderId, materials);
        if (materials.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vật tư cho đơn hàng với ID: " + saleOrderId);
        }

        // 🟢 2. Lấy danh sách nhà cung cấp cho từng vật tư
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

        // 🟢 3. Tạo mã yêu cầu mua vật tư
        String purchaseRequestCode = getNextRequestCode();

        // 🟢 4. Lưu yêu cầu mua vật tư vào DB
        PurchaseRequest purchaseRequest = new PurchaseRequest();
        purchaseRequest.setPurchaseRequestCode(purchaseRequestCode);
        purchaseRequest.setSalesOrder(saleOrdersRepository.findById(saleOrderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + saleOrderId)));
        purchaseRequest.setCreatedDate(LocalDateTime.now());
        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);
        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);

        // 🟢 5. Lưu danh sách vật tư vào yêu cầu mua vật tư
        for (PurchaseRequestDetail detail : details) {
            detail.setPurchaseRequest(purchaseRequest);
            purchaseRequestDetailRepository.save(detail);
        }
        purchaseRequestDetailRepository.flush();

        // 🟢 6. Tải lại PurchaseRequest và purchaseRequestDetails riêng lẻ
        purchaseRequest = purchaseRequestRepository.findById(purchaseRequest.getPurchaseRequestId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu mua vật tư vừa tạo"));
        // Tải purchaseRequestDetails riêng
        List<PurchaseRequestDetail> loadedDetails = purchaseRequestDetailRepository.findAllByPurchaseRequest(purchaseRequest);
        for (PurchaseRequestDetail detail : loadedDetails) {
            Hibernate.initialize(detail.getMaterial());
            Hibernate.initialize(detail.getMaterial().getUnit());
            Hibernate.initialize(detail.getMaterial().getMaterialType());
            Hibernate.initialize(detail.getPartner());
        }
        purchaseRequest.setPurchaseRequestDetails(loadedDetails);

        // 🟢 7. Chuyển sang DTO và kiểm tra purchaseRequestDetails
        PurchaseRequestDTO dto = purchaseRequestMapper.toDTO(purchaseRequest);
        if (dto.getPurchaseRequestDetails() == null) {
            dto.setPurchaseRequestDetails(new ArrayList<>());
        }

        return dto;
    }
}