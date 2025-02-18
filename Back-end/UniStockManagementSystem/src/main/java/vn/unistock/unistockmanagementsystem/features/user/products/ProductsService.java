package vn.unistock.unistockmanagementsystem.features.user.products;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.ProductType;
import vn.unistock.unistockmanagementsystem.entities.Unit;
import vn.unistock.unistockmanagementsystem.features.user.productTypes.ProductTypeRepository;
import vn.unistock.unistockmanagementsystem.features.user.units.UnitRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductsService {
    private final ProductsRepository productsRepository;
    private final UnitRepository unitRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductsMapper productsMapper = ProductsMapper.INSTANCE;

    // 🟢 Lấy tất cả sản phẩm
    public List<ProductsDTO> getAllProducts() {
        return productsRepository.findAll().stream()
                .map(productsMapper::toDTO)
                .collect(Collectors.toList());
    }

    // 🟢 Tạo sản phẩm mới
    public ProductsDTO createProduct(ProductsDTO dto) {
        // Kiểm tra mã sản phẩm đã tồn tại chưa
        if (productsRepository.existsByProductCode(dto.getProductCode())) {
            throw new IllegalArgumentException("Mã sản phẩm đã tồn tại");
        }

        // 🔹 Tìm đơn vị theo unitId
        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Đơn vị không hợp lệ"));

        // 🔹 Tìm loại sản phẩm theo productTypeId
        ProductType productType = productTypeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không hợp lệ"));

        // 🔹 Chuyển DTO thành Entity
        Product newProduct = productsMapper.toEntity(dto);
        newProduct.setUnit(unit);
        newProduct.setProductType(productType);
        newProduct.setCreatedAt(LocalDateTime.now());
        newProduct.setUpdatedAt(LocalDateTime.now());

        // ✅ Nếu updatedBy chưa có, gán giá trị từ createdBy
        if (dto.getUpdatedBy() == null || dto.getUpdatedBy().isEmpty()) {
            newProduct.setUpdatedBy(dto.getCreatedBy());
        } else {
            newProduct.setUpdatedBy(dto.getUpdatedBy());
        }

        productsRepository.save(newProduct);
        return productsMapper.toDTO(newProduct);
    }

    // 🟢 Xóa sản phẩm
    @Transactional
    public void deleteProduct(Long productId) {
        if (!productsRepository.existsById(productId)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }
        productsRepository.deleteById(productId);
    }

    // 🟢 Lấy sản phẩm theo ID
    public ProductsDTO getProductById(Long productId) {
        Product product = productsRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + productId));
        return productsMapper.toDTO(product);
    }

    // 🟢 Cập nhật sản phẩm
    public ProductsDTO updateProduct(Long productId, ProductsDTO dto) {
        Product product = productsRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        // Kiểm tra nếu productCode thay đổi và đã tồn tại
        if (!product.getProductCode().equals(dto.getProductCode()) && 
            productsRepository.existsByProductCode(dto.getProductCode())) {
            throw new IllegalArgumentException("Mã sản phẩm đã tồn tại");
        }

        product.setProductCode(dto.getProductCode());
        product.setProductName(dto.getProductName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());

        // ✅ Tìm Unit theo ID
        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Đơn vị không hợp lệ"));
        product.setUnit(unit);

        // ✅ Tìm ProductType theo ID
        ProductType productType = productTypeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Loại sản phẩm không hợp lệ"));
        product.setProductType(productType);

        // ✅ Cập nhật người sửa
        product.setUpdatedBy(dto.getUpdatedBy());
        product.setUpdatedAt(LocalDateTime.now());

        productsRepository.save(product);
        return productsMapper.toDTO(product);
    }
}