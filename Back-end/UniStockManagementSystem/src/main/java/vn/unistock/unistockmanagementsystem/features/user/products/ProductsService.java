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
import java.util.Map;
import java.util.stream.Collectors;

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

        // Tạo đối tượng Product từ DTO
        Product product = productsMapper.toEntity(dto);
        product.setIsProductionActive(dto.getIsProductionActive() != null ? dto.getIsProductionActive() : true);
        product.setCreatedBy(createdBy);
        product.setCreatedAt(LocalDateTime.now());

        // Xử lý file hình ảnh (nếu có)
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            String imageUrl = azureBlobService.uploadFile(dto.getImage());
            product.setImageUrl(imageUrl);
        }

        // Xử lý đơn vị và loại sản phẩm
        if (dto.getUnitId() != null) {
            product.setUnit(unitRepository.findById(dto.getUnitId())
                    .orElseThrow(() -> new IllegalArgumentException("Đơn vị không tồn tại!")));
        }
        if (dto.getTypeId() != null) {
            product.setProductType(productTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không tồn tại!")));
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
    @Transactional
    public ProductsDTO updateProduct(Long id, ProductsDTO updatedProduct, MultipartFile newImage) throws IOException {
        Product product = productsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Kiểm tra mã sản phẩm không trùng lặp (trừ chính sản phẩm đang sửa)
        if (!product.getProductCode().equals(updatedProduct.getProductCode()) &&
                productsRepository.existsByProductCode(updatedProduct.getProductCode())) {
            throw new IllegalArgumentException("Mã sản phẩm đã tồn tại!");
        }

        // Cập nhật thông tin sản phẩm từ DTO
        Product updatedEntity = productsMapper.toEntity(updatedProduct);
        product.setProductCode(updatedEntity.getProductCode());
        product.setProductName(updatedEntity.getProductName());
        product.setDescription(updatedEntity.getDescription());
        product.setIsProductionActive(updatedProduct.getIsProductionActive() != null ? updatedProduct.getIsProductionActive() : true);

        // Xử lý đơn vị và loại sản phẩm
        if (updatedProduct.getUnitId() != null) {
            product.setUnit(unitRepository.findById(updatedProduct.getUnitId())
                    .orElseThrow(() -> new IllegalArgumentException("Đơn vị không tồn tại!")));
        }
        if (updatedProduct.getTypeId() != null) {
            product.setProductType(productTypeRepository.findById(updatedProduct.getTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không tồn tại!")));
        }

        // Xử lý ảnh nếu có upload ảnh mới
        if (newImage != null && !newImage.isEmpty()) {
            if (product.getImageUrl() != null) {
                azureBlobService.deleteFile(product.getImageUrl());
            }
            String newImageUrl = azureBlobService.uploadFile(newImage);
            product.setImageUrl(newImageUrl);
        }

        // Cập nhật danh sách định mức vật tư
        List<ProductMaterial> productMaterials = product.getProductMaterials();
        if (updatedProduct.getMaterials() != null && !updatedProduct.getMaterials().isEmpty()) {
            // Tạo map để theo dõi các materialId hiện tại
            Map<Long, ProductMaterial> existingMaterialMap = productMaterials.stream()
                    .collect(Collectors.toMap(pm -> pm.getMaterial().getMaterialId(), pm -> pm));

            // Danh sách các phần tử sẽ giữ lại hoặc thêm mới
            List<ProductMaterial> updatedMaterials = new ArrayList<>();

            // Xử lý danh sách mới
            for (ProductMaterialsDTO materialDTO : updatedProduct.getMaterials()) {
                ProductMaterial productMaterial = existingMaterialMap.get(materialDTO.getMaterialId());
                if (productMaterial != null) {
                    // Cập nhật số lượng nếu đã tồn tại
                    productMaterial.setQuantity(materialDTO.getQuantity());
                    updatedMaterials.add(productMaterial);
                    existingMaterialMap.remove(materialDTO.getMaterialId()); // Đánh dấu đã xử lý
                } else {
                    // Thêm mới nếu không tồn tại
                    productMaterial = new ProductMaterial();
                    productMaterial.setProduct(product);
                    productMaterial.setMaterial(materialRepository.findById(materialDTO.getMaterialId())
                            .orElseThrow(() -> new IllegalArgumentException("Nguyên vật liệu không tồn tại!")));
                    productMaterial.setQuantity(materialDTO.getQuantity());
                    updatedMaterials.add(productMaterial);
                }
            }

            // Xóa các định mức không còn trong danh sách mới
            if (!existingMaterialMap.isEmpty()) {
                productMaterials.removeAll(existingMaterialMap.values());
                productMaterialsRepository.deleteAll(existingMaterialMap.values());
            }

            // Thêm các định mức mới (nếu có)
            productMaterials.addAll(updatedMaterials.stream()
                    .filter(pm -> !existingMaterialMap.containsKey(pm.getMaterial().getMaterialId()))
                    .collect(Collectors.toList()));
        } else {
            // Nếu materials là null hoặc rỗng, xóa toàn bộ định mức hiện tại
            if (!productMaterials.isEmpty()) {
                productMaterialsRepository.deleteAll(productMaterials);
                productMaterials.clear();
            }
        }

        // Lưu sản phẩm đã cập nhật
        Product savedProduct = productsRepository.save(product);
        return productsMapper.toDTO(savedProduct);
    }

    // 🟢 Bật/tắt trạng thái sản xuất
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
}