package vn.unistock.unistockmanagementsystem.features.user.productTypes;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/unistock/user/product-types")
@RequiredArgsConstructor
public class ProductTypeController {
    private final ProductTypeService productTypeService;

    @GetMapping
    public ResponseEntity<List<ProductTypeDTO>> getAllProductTypes() {
        return ResponseEntity.ok(productTypeService.getAllProductTypes());
    }
}