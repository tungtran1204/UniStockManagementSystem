package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

import java.util.ArrayList;
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
        if (warehouseRepository.existsByWarehouseName(warehouseDTO.getWarehouseName()))
            throw new RuntimeException("Kho đã tồn tại");
        warehouse = warehouseMapper.toEntity(warehouseDTO);
        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
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



}
