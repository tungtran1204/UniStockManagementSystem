package vn.unistock.unistockmanagementsystem.features.user.units;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitService {
    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper = UnitMapper.INSTANCE;

    public Page<UnitDTO> getAllUnits(Pageable pageable) {
        Page<Unit> units = unitRepository.findAll(pageable);
        return units.map(unitMapper::toDTO);
    }

    public UnitDTO toggleStatus(Long unitId, Boolean newStatus) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị tính với ID: " + unitId));
        unit.setStatus(newStatus);
        unitRepository.save(unit);
        return unitMapper.toDTO(unit);
    }

    public UnitDTO createUnit(UnitDTO unitDTO) {
        unitRepository.findByUnitNameIgnoreCase(unitDTO.getUnitName())
                .ifPresent(existingUnit -> {
                    throw new RuntimeException("Tên đơn vị tính '" + unitDTO.getUnitName() + "' đã tồn tại!");
                });

        Unit unit = unitMapper.toEntity(unitDTO);
        unit.setStatus(true);
        Unit savedUnit = unitRepository.save(unit);
        return unitMapper.toDTO(savedUnit);
    }

    public List<UnitDTO> getActiveUnits() {
        return unitRepository.findAll().stream()
                .filter(Unit::getStatus)
                .map(unitMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UnitDTO updateUnit(Long unitId, UnitDTO unitDTO) {
        Unit existingUnit = unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị tính với ID: " + unitId));

        // Kiểm tra trùng tên nếu tên mới khác tên hiện tại
        if (!existingUnit.getUnitName().equalsIgnoreCase(unitDTO.getUnitName())) {
            unitRepository.findByUnitNameIgnoreCase(unitDTO.getUnitName())
                    .ifPresent(unit -> {
                        throw new RuntimeException("Đơn vị tính '" + unitDTO.getUnitName() + "' đã tồn tại!");
                    });
        }

        existingUnit.setUnitName(unitDTO.getUnitName());
        existingUnit.setStatus(unitDTO.getStatus());
        Unit updatedUnit = unitRepository.save(existingUnit);
        return unitMapper.toDTO(updatedUnit);
    }
}