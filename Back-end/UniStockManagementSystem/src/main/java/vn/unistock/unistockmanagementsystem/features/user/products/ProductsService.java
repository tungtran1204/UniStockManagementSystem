package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Product;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductsService {
    private final ProductsRepository productsRepository;
    private final ProductsMapper productsMapper = ProductsMapper.INSTANCE;

    // 🟢 Lấy tất cả sản phẩm (User có quyền xem tất cả)
    public List<ProductsDTO> getAllProducts() {
        return productsRepository.findAll()
                .stream()
                .map(productsMapper::toDTO)
                .collect(Collectors.toList());
    }

    // 🟢 Lấy danh sách sản phẩm của chính User
    public List<ProductsDTO> getUserProducts(Long userId) {
        return productsRepository.findByCreatedBy(userId)
                .stream()
                .map(productsMapper::toDTO)
                .collect(Collectors.toList());
    }

    // 🟢 User tạo sản phẩm mới
    public ProductsDTO createProduct(ProductsDTO dto, Long userId) {
        Product product = productsMapper.toEntity(dto);
        product.setCreatedBy(userId);
        return productsMapper.toDTO(productsRepository.save(product));
    }

    // 🟢 User cập nhật sản phẩm của chính mình
    public ProductsDTO updateProduct(Long productId, ProductsDTO dto, Long userId) {
        Product product = productsRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        if (!product.getCreatedBy().equals(userId)) {
            throw new SecurityException("Bạn không có quyền chỉnh sửa sản phẩm này");
        }

        product.setProductName(dto.getProductName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());

        return productsMapper.toDTO(productsRepository.save(product));
    }

    // 🟢 User xóa sản phẩm của chính mình
    public void deleteProduct(Long productId, Long userId) {
        Product product = productsRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        if (!product.getCreatedBy().equals(userId)) {
            throw new SecurityException("Bạn không có quyền xóa sản phẩm này");
        }

        productsRepository.delete(product);
    }
}
