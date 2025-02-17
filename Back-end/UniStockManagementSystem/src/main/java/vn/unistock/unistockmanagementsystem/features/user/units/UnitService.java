package vn.unistock.unistockmanagementsystem.features.user.units;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitService {
    private final UnitRepository unitRepository;

    public List<UnitDTO> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(unit -> new UnitDTO(unit.getUnitId(), unit.getUnitName()))
                .toList();
    }
}
