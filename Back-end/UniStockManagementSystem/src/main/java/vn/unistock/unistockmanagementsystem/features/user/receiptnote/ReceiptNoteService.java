package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.admin.user.UserRepository;
import vn.unistock.unistockmanagementsystem.features.user.inventory.InventoryRepository;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;
import vn.unistock.unistockmanagementsystem.features.user.purchaseOrder.PurchaseOrderRepository;
import vn.unistock.unistockmanagementsystem.features.user.purchaseOrder.PurchaseOrderService;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseRepository;
import vn.unistock.unistockmanagementsystem.security.filter.CustomUserDetails;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceiptNoteService {
    private static final Logger logger = LoggerFactory.getLogger(ReceiptNoteService.class);

    @Autowired private ReceiptNoteDetailRepository goodReceiptDetailRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private MaterialsRepository materialRepository;
    @Autowired private ProductsRepository productRepository;
    @Autowired private ReceiptNoteRepository receiptNoteRepository;
    @Autowired private ReceiptNoteMapper receiptNoteMapper;
    @Autowired private PaperEvidenceRepository paperEvidenceRepository;
    @Autowired private AzureBlobService azureBlobService;
    @Autowired private UnitRepository unitRepository;
    @Autowired private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired private PurchaseOrderService purchaseOrderService;

    public Page<ReceiptNoteDTO> getAllReceiptNote(Pageable page) {
        Page<GoodReceiptNote> notes = receiptNoteRepository.findAll(page);
        return notes.map(receiptNoteMapper::toDTO);
    }

    public ReceiptNoteDTO getAllReceiptNoteById(Long receiptNoteId) {
        GoodReceiptNote note = receiptNoteRepository.findById(receiptNoteId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + receiptNoteId));
        ReceiptNoteDTO dto = receiptNoteMapper.toDTO(note);
        List<String> files = paperEvidenceRepository
                .findByNoteIdAndNoteType(receiptNoteId, PaperEvidence.NoteType.GOOD_RECEIPT_NOTE)
                .stream()
                .map(PaperEvidence::getPaperUrl)
                .collect(Collectors.toList());
        dto.setPaperEvidence(files);
        return dto;
    }

    @Transactional
    public ReceiptNoteDTO createGoodReceipt(ReceiptNoteDTO grnDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User currentUser = userDetails.getUser();

        GoodReceiptNote grn = GoodReceiptNote.builder()
                .grnCode(grnDto.getGrnCode())
                .description(grnDto.getDescription())
                .category(grnDto.getCategory())
                .receiptDate(grnDto.getReceiptDate())
                .createdBy(currentUser)
                .details(new ArrayList<>())
                .build();

        boolean hasSaleOrder = false;
        if (grnDto.getPoId() != null) {
            PurchaseOrder po = purchaseOrderRepository.findById(grnDto.getPoId())
                    .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + grnDto.getPoId()));
            grn.setPurchaseOrder(po);
            try {
                purchaseOrderService.getSaleOrderFromPurchaseOrder(po.getPoId());
                hasSaleOrder = true;
            } catch (Exception ignored) {
                hasSaleOrder = false;
            }
        }

        grn = receiptNoteRepository.save(grn);

        List<GoodReceiptDetail> details = new ArrayList<>();
        for (ReceiptNoteDetailDTO detailDto : grnDto.getDetails()) {
            if (detailDto.getWarehouseId() == null) {
                throw new RuntimeException("warehouseId is required");
            }
            Warehouse warehouse = warehouseRepository.findById(detailDto.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + detailDto.getWarehouseId()));

            GoodReceiptDetail detail = GoodReceiptDetail.builder()
                    .warehouse(warehouse)
                    .quantity(detailDto.getQuantity())
                    .goodReceiptNote(grn)
                    .referenceId(detailDto.getReferenceId())
                    .referenceType(detailDto.getReferenceType())
                    .build();

            if (detailDto.getUnitId() != null) {
                Unit unit = unitRepository.findById(detailDto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found with ID: " + detailDto.getUnitId()));
                detail.setUnit(unit);
            }

            if (detailDto.getMaterialId() != null) {
                Material material = materialRepository.findById(detailDto.getMaterialId())
                        .orElseThrow(() -> new RuntimeException("Material not found with ID: " + detailDto.getMaterialId()));
                detail.setMaterial(material);
                if (detail.getUnit() == null) detail.setUnit(material.getUnit());
                updateInventoryAndTransaction(warehouse, material, null, detailDto.getQuantity(), hasSaleOrder, grn);            }
            else if (detailDto.getProductId() != null) {
                Product product = productRepository.findById(detailDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with ID: " + detailDto.getProductId()));
                detail.setProduct(product);
                if (detail.getUnit() == null) detail.setUnit(product.getUnit());
                updateInventoryAndTransaction(warehouse, null, product, detailDto.getQuantity(), hasSaleOrder, grn);            }

            details.add(detail);
        }

        goodReceiptDetailRepository.saveAll(details);
        grn.setDetails(details);
        return receiptNoteMapper.toDTO(grn);
    }

    private void updateInventoryAndTransaction(Warehouse warehouse, Material material, Product product, Double quantity, boolean hasSaleOrder, GoodReceiptNote grn) {
        Inventory.InventoryStatus status = hasSaleOrder ? Inventory.InventoryStatus.RESERVED : Inventory.InventoryStatus.AVAILABLE;
        Inventory inventory = null;

        if (material != null) {
            inventory = inventoryRepository.findByWarehouseAndMaterial(warehouse, material)
                    .filter(i -> i.getStatus() == status)
                    .orElse(null);
            if (inventory == null) {
                inventory = Inventory.builder()
                        .warehouse(warehouse)
                        .material(material)
                        .status(status)
                        .quantity(0.0)
                        .build();
            }
            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventory.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inventory);

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .warehouse(warehouse)
                    .material(material)
                    .transactionType(InventoryTransaction.TransactionType.IMPORT)
                    .quantity(quantity)
                    .goodReceiptNote(grn)
                    .referenceType(InventoryTransaction.NoteType.GOOD_RECEIPT_NOTE)
                    .build();
            inventoryTransactionRepository.save(transaction);
        }

        if (product != null) {
            inventory = inventoryRepository.findByWarehouseAndProduct(warehouse, product)
                    .filter(i -> i.getStatus() == status)
                    .orElse(null);
            if (inventory == null) {
                inventory = Inventory.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .status(status)
                        .quantity(0.0)
                        .build();
            }
            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventory.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inventory);

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .warehouse(warehouse)
                    .product(product)
                    .transactionType(InventoryTransaction.TransactionType.IMPORT)
                    .quantity(quantity)
                    .goodReceiptNote(grn)
                    .referenceType(InventoryTransaction.NoteType.GOOD_RECEIPT_NOTE)
                    .build();
            inventoryTransactionRepository.save(transaction);
        }
    }
    @Transactional
    public String getNextReceiptCode() {
        try {
            Long maxId = receiptNoteRepository.findMaxGoodReceiptNoteId();
            Long nextId = (maxId != null) ? (maxId + 1) : 1;
            return String.format("NK%05d", nextId);
        } catch (Exception e) {
            logger.error("Error generating next receipt note code", e);
            throw new RuntimeException("Không thể tạo mã phiếu nhập mới: " + e.getMessage(), e);
        }
    }

    @Transactional
    public List<String> uploadPaperEvidence(Long noteId, String noteType, List<MultipartFile> files, User currentUser) {
        logger.info("Uploading {} files for note ID: {}, type: {}", files.size(), noteId, noteType);

        if (noteType.equals("GOOD_RECEIPT_NOTE")) {
            receiptNoteRepository.findById(noteId)
                    .orElseThrow(() -> new RuntimeException("Receipt Note not found with ID: " + noteId));
        }

        List<String> fileUrls = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileUrl = azureBlobService.uploadFile(file);

                    PaperEvidence evidence = PaperEvidence.builder()
                            .noteId(noteId)
                            .noteType(PaperEvidence.NoteType.valueOf(noteType))
                            .paperUrl(fileUrl)
                            .build();

                    paperEvidenceRepository.save(evidence);
                    fileUrls.add(fileUrl);

                    logger.info("Successfully uploaded file: {} for note ID: {}", file.getOriginalFilename(), noteId);
                }
            }

            return fileUrls;
        } catch (Exception e) {
            logger.error("Error uploading files", e);
            throw new RuntimeException("Failed to upload files: " + e.getMessage(), e);
        }
    }
}
