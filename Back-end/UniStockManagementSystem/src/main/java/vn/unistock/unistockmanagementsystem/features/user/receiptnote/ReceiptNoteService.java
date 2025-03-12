package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.*;
import vn.unistock.unistockmanagementsystem.features.admin.user.UserRepository;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;
import vn.unistock.unistockmanagementsystem.features.user.warehouse.WarehouseRepository;

@Service
@RequiredArgsConstructor
public class ReceiptNoteService {
    @PersistenceContext
    private final ReceiptNoteRepository goodReceiptNoteRepository;
    private final ReceiptNoteDetailRepository goodReceiptDetailRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final WarehouseRepository warehouseRepository;
    private final MaterialsRepository materialRepository;
    private final ProductsRepository productRepository;
    private final UserRepository userRepository;

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
}
