package vn.unistock.unistockmanagementsystem.features.user.units;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitService {
    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;

    public List<UnitDTO> getAllUnits() {
        return unitRepository.findAll()
                .stream()
                .map(unitMapper::toDTO)
                .collect(Collectors.toList());
    }
}

