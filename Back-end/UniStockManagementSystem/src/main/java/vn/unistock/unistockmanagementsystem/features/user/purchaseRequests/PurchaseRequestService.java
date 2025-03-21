package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.RequiredArgsConstructor;
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

        public Page<PurchaseRequestDTO> getAllPurchaseRequests(Pageable pageable) {
            Page<PurchaseRequest> requests = purchaseRequestRepository.findAll(pageable);
            return requests.map(purchaseRequestMapper::toDTO);
        }

    public PurchaseRequestDTO getPurchaseRequestById(Long purchaseRequestId) {
        PurchaseRequest request = purchaseRequestRepository.findById(purchaseRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu với ID: " + purchaseRequestId));
        return purchaseRequestMapper.toDTO(request);
    }

    @Transactional
    public PurchaseRequestDTO createManualPurchaseRequest(PurchaseRequestDTO dto) {
        // Chuyển đổi DTO → Entity
        PurchaseRequest purchaseRequest = purchaseRequestMapper.toEntity(dto);
        purchaseRequest.setCreatedDate(LocalDateTime.now());
        purchaseRequest.setStatus(PurchaseRequest.RequestStatus.PENDING);

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

        // Chuyển String thành RequestStatus
        PurchaseRequest.RequestStatus statusEnum;
        try {
            statusEnum = PurchaseRequest.RequestStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ: " + newStatus + ". Chỉ được phép là: PENDING, CONFIRMED, CANCELLED, FINISHED");
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
}