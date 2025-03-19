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
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;

import vn.unistock.unistockmanagementsystem.features.user.purchaseOrder.PurchaseOrderRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseRepository;
import vn.unistock.unistockmanagementsystem.security.filter.CustomUserDetails;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ReceiptNoteService {
    private static final Logger logger = LoggerFactory.getLogger(ReceiptNoteService.class);

    @Autowired
    private ReceiptNoteDetailRepository goodReceiptDetailRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private MaterialsRepository materialRepository;
    @Autowired
    private ProductsRepository productRepository;
    @Autowired
    private ReceiptNoteRepository receiptNoteRepository;
    @Autowired
    private ReceiptNoteMapper receiptNoteMapper;
    @Autowired
    private PaperEvidenceRepository paperEvidenceRepository;
    @Autowired
    private AzureBlobService azureBlobService;
    @Autowired
    private UnitRepository unitRepository;
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    public Page<ReceiptNoteDTO> getAllReceiptNote(Pageable page) {
            Page<GoodReceiptNote> notes = receiptNoteRepository.findAll(page);
            return notes.map(receiptNoteMapper::toDTO);
    }

    public ReceiptNoteDTO getAllReceiptNoteById(Long receiptNoteId) {
        GoodReceiptNote note = receiptNoteRepository.findById(receiptNoteId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + receiptNoteId));
        return receiptNoteMapper.toDTO(note);
    }

    @Transactional
    public ReceiptNoteDTO createGoodReceipt(ReceiptNoteDTO grnDto) {
        // Lấy user hiện tại
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User currentUser = userDetails.getUser();


        // Chuyển DTO thành Entity (GoodReceiptNote)
        GoodReceiptNote grn = GoodReceiptNote.builder()
                .grnCode(grnDto.getGrnCode())
                .description(grnDto.getDescription())
                .createdBy(currentUser)
                .details(new ArrayList<>())
                .build();

        // tham chieu chung tu khac
        if (grnDto.getPoId() != null) {
            PurchaseOrder po = purchaseOrderRepository.findById(grnDto.getPoId())
                    .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + grnDto.getPoId()));
            grn.setPurchaseOrder(po);
        }

        // Lưu GoodReceiptNote trước để lấy ID hợp lệ
        grn = receiptNoteRepository.save(grn);

        List<GoodReceiptDetail> details = new ArrayList<>();
        for (ReceiptNoteDetailDTO detailDto : grnDto.getDetails()) {
            // Kiểm tra warehouseId không null
            if (detailDto.getWarehouseId() == null) {
                throw new RuntimeException("warehouseId is required");
            }
            Warehouse warehouse = warehouseRepository.findById(detailDto.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + detailDto.getWarehouseId()));


            // Tạo GoodReceiptDetail từ DTO
            GoodReceiptDetail detail = GoodReceiptDetail.builder()
                    .warehouse(warehouse)
                    .quantity(detailDto.getQuantity())
                    .goodReceiptNote(grn)
                    .build();

            if (detailDto.getUnitId() != null) {
                Unit unit = unitRepository.findById(detailDto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found with ID: " + detailDto.getUnitId()));
                detail.setUnit(unit);
            } else {
                // Nếu không có unitId trong DTO, cần lấy unit từ material hoặc product
                if (detailDto.getMaterialId() != null) {
                    Material material = materialRepository.findById(detailDto.getMaterialId())
                            .orElseThrow(() -> new RuntimeException("Material not found with ID: " + detailDto.getMaterialId()));
                    detail.setUnit(material.getUnit()); // Giả sử Material có phương thức getUnit()
                } else if (detailDto.getProductId() != null) {
                    Product product = productRepository.findById(detailDto.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + detailDto.getProductId()));
                    detail.setUnit(product.getUnit()); // Giả sử Product có phương thức getUnit()
                }
            }

            // Lưu vào danh sách
            details.add(detail);
        }

        // Lưu danh sách chi tiết phiếu nhập
        goodReceiptDetailRepository.saveAll(details);
        grn.setDetails(details);

        // Trả về DTO
        return receiptNoteMapper.toDTO(grn);

    }

    private void updateInventory(Warehouse warehouse, Material material, Double quantity) {
        Inventory inventory = inventoryRepository.findByWarehouseAndMaterial(warehouse, material)
                .orElse(new Inventory());
        inventory.setWarehouse(warehouse);
        inventory.setMaterial(material);
        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
        saveInventoryTransaction(warehouse, material, null, quantity);
    }

    private void updateInventory(Warehouse warehouse, Product product, Double quantity) {
        Inventory inventory = inventoryRepository.findByWarehouseAndProduct(warehouse, product)
                .orElse(new Inventory());
        inventory.setWarehouse(warehouse);
        inventory.setProduct(product);
        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
        saveInventoryTransaction(warehouse, null, product, quantity);
    }

    private void saveInventoryTransaction(Warehouse warehouse, Material material, Product product, Double quantity) {
        InventoryTransaction transaction = InventoryTransaction.builder()
                .warehouse(warehouse)
                .material(material)
                .product(product)
                .transactionType(InventoryTransaction.TransactionType.IMPORT)
                .quantity(quantity)
                .referenceType(InventoryTransaction.NoteType.GOOD_RECEIPT_NOTE)
                .build();
        inventoryTransactionRepository.save(transaction);
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

        // Validate note exists if necessary
        if (noteType.equals("GOOD_RECEIPT_NOTE")) {
            receiptNoteRepository.findById(noteId)
                    .orElseThrow(() -> new RuntimeException("Receipt Note not found with ID: " + noteId));
        }

        List<String> fileUrls = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // Upload file to Azure Blob Storage
                    String fileUrl = azureBlobService.uploadFile(file);

                    // Save file metadata to database
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
