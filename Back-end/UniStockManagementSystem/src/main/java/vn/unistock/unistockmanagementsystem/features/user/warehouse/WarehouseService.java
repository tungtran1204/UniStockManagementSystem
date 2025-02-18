package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

@Service
@RequiredArgsConstructor
public class WarehouseService {
    @Autowired
    private final WarehouseRepository warehouseRepository;
    @Autowired
    private final WarehouseMapper warehouseMapper;

    public Warehouse addWarehouse(WarehouseDTO warehouseDTO) {
        Warehouse warehouse = warehouseMapper.toEntity(warehouseDTO);
        return warehouseRepository.save(warehouse) ;
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id).orElse(null);
    }

    public void deleteWarehouse(Long id) {
        warehouseRepository.deleteById(id);
    }


}
