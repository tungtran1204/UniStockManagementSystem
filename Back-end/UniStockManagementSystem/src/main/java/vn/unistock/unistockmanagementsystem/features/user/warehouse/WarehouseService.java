package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class WarehouseService {
    @Autowired
    private final WarehouseRepository warehouseRepository;
    @Autowired
    private final WarehouseMapper warehouseMapper;

    public Warehouse addWarehouse(WarehouseDTO warehouseDTO) {
        if (warehouseRepository.existsByWarehouseName(warehouseDTO.getWarehouseName()))
            throw new RuntimeException("Tên kho đã tồn tại");

        if (warehouseRepository.existsByWarehouseCode(warehouseDTO.getWarehouseCode()))
            throw new RuntimeException("Mã kho đã tồn tại");

        Warehouse warehouse = warehouseMapper.toEntity(warehouseDTO);
        return warehouseRepository.save(warehouse);
    }

    public Page<Warehouse> getAllWarehouses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Warehouse> warehousePage = warehouseRepository.findAll(pageable);
        return warehousePage;
    }

    public List<Warehouse> getAllActiveWarehouses() {
        return warehouseRepository.findAllByIsActive(true);
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy kho với ID được cung cấp"));
    }

    public Warehouse updateWarehouse(Long id, WarehouseDTO warehouseDTO) {
        Warehouse warehouse = getWarehouseById(id);
        warehouseMapper.updateEntityFromDto(warehouseDTO, warehouse);
        return warehouseRepository.save(warehouse);
    }
    public void deleteWarehouse(Long id) {
        warehouseRepository.deleteById(id);
    }

    public Warehouse updateWarehouseStatus(Long id, Boolean isActive) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setIsActive(isActive);
        return  warehouseRepository.save(warehouse);
    }

    public List<String> getUsedWarehouseCategories() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        return warehouses.stream()
                .map(Warehouse::getGoodCategory)
                .filter(Objects::nonNull)
                .flatMap(cat -> Arrays.stream(cat.split(",\\s*")))
                .distinct()
                .toList();
    }

    public boolean isWarehouseCodeExists(String warehouseCode, Long excludeId) {
        if (excludeId != null) {
            return warehouseRepository.existsByWarehouseCodeAndWarehouseIdNot(warehouseCode, excludeId);
        }
        return warehouseRepository.existsByWarehouseCode(warehouseCode);
    }
}
