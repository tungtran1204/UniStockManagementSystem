package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {
    @Autowired
    private final WarehouseRepository warehouseRepository;
    @Autowired
    private final WarehouseMapper warehouseMapper;

    public Warehouse addWarehouse(WarehouseDTO warehouseDTO) {
        Warehouse warehouse =  new Warehouse();
        boolean codeExists = warehouseRepository.existsByWarehouseCode(warehouseDTO.getWarehouseCode());
        boolean nameExists = warehouseRepository.existsByWarehouseName(warehouseDTO.getWarehouseName());

        if (codeExists && nameExists) {
            throw new IllegalArgumentException("DUPLICATE_CODE_AND_NAME");
        } else if (codeExists) {
            throw new IllegalArgumentException("DUPLICATE_CODE");
        } else if (nameExists) {
            throw new IllegalArgumentException("DUPLICATE_NAME");
        }

        warehouse = warehouseMapper.toEntity(warehouseDTO);
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

        boolean isCodeChanged = !warehouse.getWarehouseCode().equals(warehouseDTO.getWarehouseCode());
        boolean isNameChanged = !warehouse.getWarehouseName().equals(warehouseDTO.getWarehouseName());

        boolean codeExists = isCodeChanged && warehouseRepository.existsByWarehouseCode(warehouseDTO.getWarehouseCode());
        boolean nameExists = isNameChanged && warehouseRepository.existsByWarehouseName(warehouseDTO.getWarehouseName());

        if (codeExists && nameExists) {
            throw new IllegalArgumentException("DUPLICATE_CODE_AND_NAME");
        } else if (codeExists) {
            throw new IllegalArgumentException("DUPLICATE_CODE");
        } else if (nameExists) {
            throw new IllegalArgumentException("DUPLICATE_NAME");
        }

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

}
