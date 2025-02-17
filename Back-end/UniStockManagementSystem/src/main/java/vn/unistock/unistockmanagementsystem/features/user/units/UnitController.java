package vn.unistock.unistockmanagementsystem.features.user.units;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/units")
@RequiredArgsConstructor
public class UnitController {
    private final UnitService unitService;

    @GetMapping
    public ResponseEntity<List<UnitDTO>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }
}
