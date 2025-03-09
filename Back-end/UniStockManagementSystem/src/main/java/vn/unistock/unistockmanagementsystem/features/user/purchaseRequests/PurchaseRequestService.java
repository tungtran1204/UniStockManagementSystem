package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequestDetail;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseRequestService {
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestDetailRepository purchaseRequestDetailRepository;
    private final MaterialsRepository materialsRepository;
    private final UnitRepository unitRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;

    // Lấy danh sách yêu cầu mua vật tư
    public Page<PurchaseRequestDTO> getAllPurchaseRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PurchaseRequest> purchaseRequests = purchaseRequestRepository.findAll(pageable);
        return purchaseRequests.map(purchaseRequestMapper::toDTO);
    }

    // Lấy chi tiết yêu cầu mua vật tư
    public PurchaseRequestDetailDTO getPurchaseRequestDetail(Long id) {
        PurchaseRequest purchaseRequest = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu mua vật tư với ID: " + id));
        PurchaseRequestDetailDTO dto = purchaseRequestMapper.toDetailDTO(purchaseRequest);

        List<PurchaseRequestDetail> details = purchaseRequestDetailRepository.findByPurchaseRequestPurchaseRequestId(id);
        List<MaterialItemDTO> materialItems = details.stream()
                .map(purchaseRequestMapper::toMaterialItemDTO)
                .collect(Collectors.toList());
        dto.setMaterials(materialItems);

        return dto;
    }

    // Tạo yêu cầu mua vật tư thủ công
    @Transactional
    public PurchaseRequestDTO createPurchaseRequestManual(String purchaseRequestCode, List<MaterialInputDTO> materials) {
        if (purchaseRequestRepository.existsByPurchaseRequestCode(purchaseRequestCode)) {
            throw new IllegalArgumentException("Mã yêu cầu mua vật tư đã tồn tại!");
        }

        PurchaseRequest purchaseRequest = new PurchaseRequest();
        purchaseRequest.setPurchaseRequestCode(purchaseRequestCode);
        purchaseRequest.setSalesOrder(null); // Không liên kết với đơn hàng
        purchaseRequest.setCreatedDate(LocalDateTime.now());
        purchaseRequest.setStatus("Chờ xác nhận");
        PurchaseRequest savedPurchaseRequest = purchaseRequestRepository.save(purchaseRequest);

        List<PurchaseRequestDetail> details = materials.stream().map(materialInput -> {
            PurchaseRequestDetail detail = new PurchaseRequestDetail();
            detail.setPurchaseRequest(savedPurchaseRequest);
            detail.setMaterial(materialsRepository.findById(materialInput.getMaterialId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vật tư với ID: " + materialInput.getMaterialId())));
            detail.setQuantity(materialInput.getQuantity());
            detail.setUnit(detail.getMaterial().getUnit());
            return detail;
        }).collect(Collectors.toList());

        purchaseRequestDetailRepository.saveAll(details);
        savedPurchaseRequest.setPurchaseRequestDetails(details);

        return purchaseRequestMapper.toDTO(savedPurchaseRequest);
    }
}