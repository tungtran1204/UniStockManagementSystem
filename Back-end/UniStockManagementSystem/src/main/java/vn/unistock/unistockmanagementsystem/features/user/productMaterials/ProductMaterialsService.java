package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.ProductMaterial;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductMaterialsService {
    private final ProductMaterialsRepository productMaterialRepository;
    private final ProductsRepository productRepository;
    private final MaterialsRepository materialRepository;
    private final ProductMaterialsMapper productMaterialMapper;

    public Page<ProductMaterialsDTO> getMaterialsByProduct(Long productId, Pageable pageable) {
        Page<ProductMaterial> productMaterialsPage = productMaterialRepository.findByProduct_ProductId(productId, pageable);
        return productMaterialsPage.map(productMaterialMapper::toDTO);
    }

    @Transactional
    public void saveProductMaterials(Long productId, List<ProductMaterialsDTO> materialsDTOList) {
        for (ProductMaterialsDTO dto : materialsDTOList) {
            Optional<ProductMaterial> existingMaterial = productMaterialRepository.findByProductIdAndMaterialId(productId, dto.getMaterialId());

            if (existingMaterial.isPresent()) {
                ProductMaterial material = existingMaterial.get();
                if (material.getQuantity() != dto.getQuantity()) {
                    material.setQuantity(dto.getQuantity());
                    productMaterialRepository.save(material);
                }
            } else {
                ProductMaterial newMaterial = new ProductMaterial();
                newMaterial.setProduct(productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found")));
                newMaterial.setMaterial(materialRepository.findById(dto.getMaterialId()).orElseThrow(() -> new RuntimeException("Material not found")));
                newMaterial.setQuantity(dto.getQuantity());
                productMaterialRepository.save(newMaterial);
            }
        }
    }

    @Transactional
    public void deleteProductMaterial(Long productId, Long materialId) {
        productMaterialRepository.deleteByProductIdAndMaterialId(productId, materialId);
    }
}