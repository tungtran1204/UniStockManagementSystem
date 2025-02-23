package vn.unistock.unistockmanagementsystem.features.user.products;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.storage.AzureBlobService;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;
import lombok.extern.slf4j.Slf4j;


import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductsService {
    private final ProductsRepository productsRepository;
    private final UnitRepository unitRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductsMapper productsMapper = ProductsMapper.INSTANCE;
    private final AzureBlobService azureBlobService;



    private ProductsDTO convertToDTO(Product product) {
        ProductsDTO dto = new ProductsDTO();

        dto.setProductId(product.getProductId());
        dto.setProductCode(product.getProductCode());
        dto.setProductName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());

        if (product.getUnit() != null) {
            dto.setUnitId(product.getUnit().getUnitId());
            dto.setUnitName(product.getUnit().getUnitName());
        }

        if (product.getProductType() != null) {
            dto.setTypeId(product.getProductType().getTypeId());
            dto.setTypeName(product.getProductType().getTypeName());
        }

        dto.setIsProductionActive(product.getIsProductionActive());
        dto.setImageUrl(product.getImageUrl());

        return dto;
    }


    // 🟢 Lấy tất cả sản phẩm
    public Page<ProductsDTO> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productsRepository.findAll(pageable);
        return productPage.map(this::convertToDTO);
    }


    // 🟢 Tạo sản phẩm mới

    public Product createProduct(ProductsDTO productDTO, String createdBy) {

        Product product = new Product();
        product.setProductCode(productDTO.getProductCode());
        product.setProductName(productDTO.getProductName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());

        if (productDTO.getUnitId() != null) {
            product.setUnit(unitRepository.findById(productDTO.getUnitId()).orElse(null));
        }
        if (productDTO.getTypeId() != null) {
            product.setProductType(productTypeRepository.findById(productDTO.getTypeId()).orElse(null));
        }

        product.setIsProductionActive(productDTO.getIsProductionActive() != null ? productDTO.getIsProductionActive() : true);

        // 🛑 Quan trọng: Đảm bảo set imageUrl vào entity trước khi lưu
        product.setImageUrl(productDTO.getImageUrl());

        product.setCreatedBy(createdBy);
        product.setCreatedAt(LocalDateTime.now());
        return productsRepository.save(product);
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
        product.setPrice(updatedProduct.getPrice());

        if (updatedProduct.getUnitId() != null) {
            product.setUnit(unitRepository.findById(updatedProduct.getUnitId()).orElse(null));
        }
        if (updatedProduct.getTypeId() != null) {
            product.setProductType(productTypeRepository.findById(updatedProduct.getTypeId()).orElse(null));
        }

        Product savedProduct = productsRepository.save(product);
        return convertToDTO(savedProduct);
    }
}