package vn.unistock.unistockmanagementsystem.features.user.partnerType;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/partner/type")
@RequiredArgsConstructor
public class PartnerTypeController {
    private final PartnerTypeService partnerTypeService;

    // API: Lấy danh sách loại đối tác
    @GetMapping
    public ResponseEntity<List<PartnerTypeDTO>> getAllPartnerTypes() {
        return ResponseEntity.ok(partnerTypeService.getAllPartnerTypes());
    }

    // API: Tạo mới loại đối tác
    @PostMapping("/add")
    public ResponseEntity<PartnerTypeDTO> createPartnerType(@RequestBody PartnerTypeDTO partnerTypeDTO) {
        if (partnerTypeService.existsByTypeCodeOrTypeName(partnerTypeDTO.getTypeCode(), partnerTypeDTO.getTypeName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok(partnerTypeService.addPartnerType(partnerTypeDTO));
    }

    // API: Update thông tin loại đối tác
    @PutMapping("/edit/{id}")
    public ResponseEntity<PartnerTypeDTO> updatePartnerType(@PathVariable Long id, @RequestBody PartnerTypeDTO partnerTypeDTO) {
        if (partnerTypeService.existsByTypeCodeOrTypeName(partnerTypeDTO.getTypeCode(), partnerTypeDTO.getTypeName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok(partnerTypeService.updatePartnerType(id, partnerTypeDTO));
    }
}