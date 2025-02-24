package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsDTO;

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

    public Page<Warehouse> getAllWarehouses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Warehouse> warehousePage = warehouseRepository.findAll(pageable);
        return warehousePage;
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
