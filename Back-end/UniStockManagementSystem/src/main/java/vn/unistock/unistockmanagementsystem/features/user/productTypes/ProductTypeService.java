package vn.unistock.unistockmanagementsystem.features.user.productTypes;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.ProductType;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductTypeService {
    private final ProductTypeRepository productTypeRepository;

    public List<ProductTypeDTO> getAllProductTypes() {
        return productTypeRepository.findAll().stream()
                .map(type -> new ProductTypeDTO(type.getTypeId(), type.getTypeName()))
                .toList();
    }
}
