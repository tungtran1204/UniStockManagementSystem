package vn.unistock.unistockmanagementsystem.features.user.partner;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unistock/user/partner")
public class PartnerController {
    @Autowired
    private PartnerService partnerService;

    @GetMapping("/list")
    public ResponseEntity<List<PartnerDTO>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    @PostMapping("/add")
    public ResponseEntity<?> createPartner(@Valid @RequestBody PartnerDTO partnerDTO) {
        try {
            return ResponseEntity.ok(partnerService.createPartner(partnerDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
