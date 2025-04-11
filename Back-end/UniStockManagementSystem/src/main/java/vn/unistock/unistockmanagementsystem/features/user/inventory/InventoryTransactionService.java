package vn.unistock.unistockmanagementsystem.features.user.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.InventoryTransaction;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InventoryTransactionService {
        private final InventoryTransactionRepository transactionRepo;
        private final InventoryRepository inventoryRepo;
        private final ProductsRepository productRepo;
        private final MaterialsRepository materialRepo;
        private final StockMovementReportMapper stockMovementReportMapper;

        public List<StockMovementReportDTO> getStockMovement(
                LocalDateTime startDate,
                LocalDateTime endDate,
                String itemType,
                Boolean hasMovementOnly) {

            List<Map<String, Object>> summary = transactionRepo.summarizeTransactions(startDate, endDate);
            System.out.println("DEBUG: Tổng số dòng giao dịch: " + summary.size());

            Map<Long, Double> productIn = new HashMap<>();
            Map<Long, Double> productOut = new HashMap<>();
            Map<Long, Double> materialIn = new HashMap<>();
            Map<Long, Double> materialOut = new HashMap<>();

            for (Map<String, Object> row : summary) {
                System.out.println("DEBUG: Dòng = " + row);
                Long pid = (Long) row.getOrDefault("productId", null);
                Long mid = (Long) row.getOrDefault("materialId", null);
                InventoryTransaction.TransactionType type = InventoryTransaction.TransactionType.valueOf(row.get("type").toString());
                Double total = ((Number) row.get("total")).doubleValue();

                if (pid != null) {
                    if (type == InventoryTransaction.TransactionType.IMPORT) {
                        productIn.put(pid, total);
                    } else {
                        productOut.put(pid, total);
                    }
                } else if (mid != null) {
                    if (type == InventoryTransaction.TransactionType.IMPORT) {
                        materialIn.put(mid, total);
                    } else {
                        materialOut.put(mid, total);
                    }
                }
            }

            List<StockMovementReportDTO> result = new ArrayList<>();

            if (!"MATERIAL".equalsIgnoreCase(itemType)) {
                for (Product p : productRepo.findAll()) {
                    Long id = p.getProductId();
                    double in = productIn.getOrDefault(id, 0.0);
                    double out = productOut.getOrDefault(id, 0.0);
                    double end = Optional.ofNullable(inventoryRepo.getTotalQuantityAcrossWarehousesByProduct(id)).orElse(0.0);
                    System.out.println("Product ID " + id + " - tồn cuối kỳ = " + end);
                    double begin = end - in + out;

                    if (!Boolean.TRUE.equals(hasMovementOnly) || in > 0 || out > 0) {
                        result.add(stockMovementReportMapper.fromProduct(p, begin, in, out, end));
                    }
                }
            }

            if (!"PRODUCT".equalsIgnoreCase(itemType)) {
                for (Material m : materialRepo.findAll()) {
                    Long id = m.getMaterialId();
                    double in = materialIn.getOrDefault(id, 0.0);
                    double out = materialOut.getOrDefault(id, 0.0);
                    double end = Optional.ofNullable(inventoryRepo.getTotalQuantityAcrossWarehousesByMaterial(id)).orElse(0.0);
                    System.out.println("Material ID " + id + " - tồn cuối kỳ = " + end);
                    double begin = end - in + out;

                    if (!Boolean.TRUE.equals(hasMovementOnly) || in > 0 || out > 0) {
                        result.add(stockMovementReportMapper.fromMaterial(m, begin, in, out, end));
                    }
                }
            }
            return result;
        }
}
