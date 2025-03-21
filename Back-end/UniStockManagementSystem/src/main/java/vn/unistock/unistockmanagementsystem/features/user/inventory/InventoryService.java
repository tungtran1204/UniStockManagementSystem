package vn.unistock.unistockmanagementsystem.features.user.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public Double getTotalQuantityOfProduct(Long productId) {
        return inventoryRepository.getTotalQuantityByProductId(productId);
    }

    public List<InventoryByWarehouseDTO> getInventoryDetailsByProduct(Long productId) {
        return inventoryRepository.findInventoryByProductId(productId);
    }


}
