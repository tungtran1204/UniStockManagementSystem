package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.admin.user.UserRepository;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;
import vn.unistock.unistockmanagementsystem.features.user.purchaseRequests.PurchaseRequestDTO;
import vn.unistock.unistockmanagementsystem.features.user.purchaseRequests.PurchaseRequestService;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseRepository;

@Service
@RequiredArgsConstructor
public class ReceiptNoteService {
    private static final Logger logger = LoggerFactory.getLogger(ReceiptNoteService.class);

    @Autowired
    private ReceiptNoteRepository goodReceiptNoteRepository;
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
    private UserRepository userRepository;
    @Autowired
    private ReceiptNoteRepository receiptNoteRepository;
    @Autowired
    private ReceiptNoteMapper receiptNoteMapper;

    public Page<ReceiptNoteDTO> getAllReceiptNote(Pageable pageable) {
        Page<GoodReceiptNote> notes = receiptNoteRepository.findAll(pageable);
        return notes.map(receiptNoteMapper::toDTO);
    }

    public ReceiptNoteDTO getAllReceiptNoteById(Long receiptNoteId) {
        GoodReceiptNote note = receiptNoteRepository.findById(receiptNoteId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + receiptNoteId));
        return receiptNoteMapper.toDTO(note);
    }

    @Transactional
    public GoodReceiptNote createGoodReceipt(ReceiptNoteDTO grnDto) {

        String username = getAuthenticatedUsername();
        User user = userRepository.findByUsername(username);

        GoodReceiptNote grn = GoodReceiptNote.builder()
                .grnCode(grnDto.getGrnCode())
                .description(grnDto.getDescription())
                .createdBy(user)
                .build();
        goodReceiptNoteRepository.save(grn);

        for (GoodReceiptDetail detailDto : grnDto.getDetails()) {
            Warehouse warehouse = warehouseRepository.findById(detailDto.getWarehouse().getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found"));

            GoodReceiptDetail detail = GoodReceiptDetail.builder()
                    .goodReceiptNote(grn)
                    .warehouse(warehouse)
                    .quantity(detailDto.getQuantity())
                    .unit(detailDto.getUnit())
                    .build();

            if (detailDto.getMaterial() != null) {
                Material material = materialRepository.findById(detailDto.getMaterial().getMaterialId())
                        .orElseThrow(() -> new RuntimeException("Material not found"));
                detail.setMaterial(material);
                updateInventory(warehouse, material, detailDto.getQuantity());
            } else if (detailDto.getProduct() != null) {
                Product product = productRepository.findById(detailDto.getProduct().getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                detail.setProduct(product);
                updateInventory(warehouse, product, detailDto.getQuantity());
            }

            goodReceiptDetailRepository.save(detail);
        }

        return grn;
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

    private String getAuthenticatedUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    @Transactional
    public String getNextRequestCode() {
        try {
            Long maxId = receiptNoteRepository.findMaxGoodReceiptNoteId();
            Long nextId = (maxId != null) ? (maxId + 1) : 1;
            return String.format("PN%05d", nextId);
        } catch (Exception e) {
            logger.error("Error generating next receipt note code", e);
            throw new RuntimeException("Không thể tạo mã phiếu nhập mới: " + e.getMessage(), e);
        }
    }
}
