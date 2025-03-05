package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.ProductMaterial;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.products.ProductsRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductMaterialsService {
    private final ProductMaterialsRepository productMaterialRepository;
    private final ProductsRepository productRepository;
    private final MaterialsRepository materialRepository;
    private final ProductMaterialsMapper productMaterialMapper;

    public ProductMaterialsService(
            ProductMaterialsRepository productMaterialRepository,
            ProductsRepository productRepository,
            MaterialsRepository materialRepository,
            ProductMaterialsMapper productMaterialMapper) {
        this.productMaterialRepository = productMaterialRepository;
        this.productRepository = productRepository;
        this.materialRepository = materialRepository;
        this.productMaterialMapper = productMaterialMapper;
    }

    public List<ProductMaterialsDTO> getMaterialsByProduct(Long productId) {
        List<ProductMaterial> productMaterials = productMaterialRepository.findByProduct_ProductId(productId);
        return productMaterials.stream()
                .map(productMaterialMapper::toDTO)
                .toList();
    }

    @Transactional
    public void saveProductMaterials(Long productId, List<ProductMaterialsDTO> materialsDTOList) {
        for (ProductMaterialsDTO dto : materialsDTOList) {
            Optional<ProductMaterial> existingMaterial = productMaterialRepository.findByProductIdAndMaterialId(productId, dto.getMaterialId());

            if (existingMaterial.isPresent()) {
                // Nếu đã tồn tại, chỉ cập nhật số lượng nếu nó đã bị thay đổi
                ProductMaterial material = existingMaterial.get();
                if (material.getQuantity() != dto.getQuantity()) {
                    material.setQuantity(dto.getQuantity()); // ✅ Chỉ cập nhật số lượng mới thay vì cộng dồn
                    productMaterialRepository.save(material);
                }
            } else {
                // Nếu chưa tồn tại, tạo mới
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
