package vn.unistock.unistockmanagementsystem.features.user.productTypes;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductTypeService {
    private final ProductTypeRepository productTypeRepository;
    private final ProductTypeMapper productTypeMapper;

    public List<ProductTypeDTO> getAllProductTypes() {
        return productTypeRepository.findAll()
                .stream()
                .map(productTypeMapper::toDTO)
                .collect(Collectors.toList());
    }
}

