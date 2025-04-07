package vn.unistock.unistockmanagementsystem.features.user.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.admin.user.UserDTO;

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

    public Page<InventoryReportDTO> getInventoryReport(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return inventoryRepository.getInventoryReport(pageable);
    }

}
