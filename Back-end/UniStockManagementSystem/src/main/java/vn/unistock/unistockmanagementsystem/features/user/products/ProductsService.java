package vn.unistock.unistockmanagementsystem.features.user.products;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.ProductMaterial;
import vn.unistock.unistockmanagementsystem.features.user.materials.MaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsDTO;
import vn.unistock.unistockmanagementsystem.features.user.productMaterials.ProductMaterialsRepository;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.utils.storage.AzureBlobService;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import lombok.extern.slf4j.Slf4j;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductsService {
    private final ProductsRepository productsRepository;
    private final UnitRepository unitRepository;
    private final ProductTypeRepository productTypeRepository;
    private final MaterialsRepository materialRepository;
    private final ProductMaterialsRepository productMaterialsRepository;
    private final ProductsMapper productsMapper = ProductsMapper.INSTANCE;
    private final AzureBlobService azureBlobService;


    // 🟢 Lấy tất cả sản phẩm
    public Page<ProductsDTO> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productsRepository.findAll(pageable);
        return productPage.map(productsMapper::toDTO);
    }


    // 🟢 Tạo sản phẩm mới
    @Transactional
    public Product createProduct(ProductsDTO dto, String createdBy) throws IOException {
        // Kiểm tra mã sản phẩm đã tồn tại chưa
        if (productsRepository.existsByProductCode(dto.getProductCode())) {
            throw new IllegalArgumentException("Mã sản phẩm đã tồn tại!");
        }

        // Tạo đối tượng Product
        Product product = new Product();
        product.setProductCode(dto.getProductCode());
        product.setProductName(dto.getProductName());
        product.setDescription(dto.getDescription());

        // Gán đơn vị và loại sản phẩm (nếu có)
        if (dto.getUnitId() != null) {
            product.setUnit(unitRepository.findById(dto.getUnitId())
                    .orElseThrow(() -> new IllegalArgumentException("Đơn vị không tồn tại!")));
        }
        if (dto.getTypeId() != null) {
            product.setProductType(productTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không tồn tại!")));
        }

        product.setIsProductionActive(dto.getIsProductionActive() != null ? dto.getIsProductionActive() : true);
        product.setCreatedBy(createdBy);
        product.setCreatedAt(LocalDateTime.now());

        // Xử lý file hình ảnh (nếu có)
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            String imageUrl = azureBlobService.uploadFile(dto.getImage());
            product.setImageUrl(imageUrl);
        }

        // Lưu sản phẩm
        Product savedProduct = productsRepository.save(product);

        // Lưu danh sách định mức nguyên vật liệu (nếu có)
        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            List<ProductMaterial> productMaterials = new ArrayList<>();
            for (ProductMaterialsDTO materialDTO : dto.getMaterials()) {
                ProductMaterial productMaterial = new ProductMaterial();
                productMaterial.setProduct(savedProduct);
                productMaterial.setMaterial(materialRepository.findById(materialDTO.getMaterialId())
                        .orElseThrow(() -> new IllegalArgumentException("Nguyên vật liệu không tồn tại!")));
                productMaterial.setQuantity(materialDTO.getQuantity());
                productMaterials.add(productMaterial);
            }
            productMaterialsRepository.saveAll(productMaterials);
            savedProduct.setProductMaterials(productMaterials);
        }

        return savedProduct;
    }


    // 🟢 Lấy sản phẩm theo ID
    public ProductsDTO getProductById(Long productId) {
        Product product = productsRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + productId));
        return productsMapper.toDTO(product);
    }

    // 🟢 Cập nhật sản phẩm


    public ProductsDTO toggleProductionStatus(Long id) {
        Product product = productsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        
        product.setIsProductionActive(!product.getIsProductionActive());
        Product savedProduct = productsRepository.save(product);
        return productsMapper.toDTO(savedProduct);
    }



    public boolean isProductCodeExists(String productCode, Long excludeId) {
        if (excludeId != null) {
            return productsRepository.existsByProductCodeAndProductIdNot(productCode, excludeId);
        }
        return productsRepository.existsByProductCode(productCode);
    }

    @Transactional
    public ProductsDTO updateProduct(Long id, ProductsDTO updatedProduct, MultipartFile newImage) throws IOException {
        Product product = productsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Xử lý ảnh nếu có upload ảnh mới
        if (newImage != null && !newImage.isEmpty()) {
            // Xóa ảnh cũ nếu có
            if (product.getImageUrl() != null) {
                azureBlobService.deleteFile(product.getImageUrl());
            }
            // Upload ảnh mới
            String newImageUrl = azureBlobService.uploadFile(newImage);
            product.setImageUrl(newImageUrl);
        }

        // Cập nhật các thông tin khác
        product.setProductCode(updatedProduct.getProductCode());
        product.setProductName(updatedProduct.getProductName());
        product.setDescription(updatedProduct.getDescription());

        if (updatedProduct.getUnitId() != null) {
            product.setUnit(unitRepository.findById(updatedProduct.getUnitId()).orElse(null));
        }
        if (updatedProduct.getTypeId() != null) {
            product.setProductType(productTypeRepository.findById(updatedProduct.getTypeId()).orElse(null));
        }

        Product savedProduct = productsRepository.save(product);
        return productsMapper.toDTO(savedProduct);
    }
}