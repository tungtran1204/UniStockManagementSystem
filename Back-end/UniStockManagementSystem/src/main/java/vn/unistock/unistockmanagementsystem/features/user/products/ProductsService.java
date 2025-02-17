package vn.unistock.unistockmanagementsystem.features.user.products;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Product;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.admin.users.UsersRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductsService {
    private final ProductsRepository productsRepository;
    private final UsersRepository usersRepository;
    private final ProductsMapper productsMapper = ProductsMapper.INSTANCE;

    // 🟢 Lấy tất cả sản phẩm (User có quyền xem tất cả)
    public List<ProductsDTO> getAllProducts() {
        return productsRepository.findAll().stream()
                .map(product -> new ProductsDTO(
                        product.getProductId(),
                        product.getProductName(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getUnit() != null ? product.getUnit().getUnitId() : null,
                        product.getUnit() != null ? product.getUnit().getUnitName() : "N/A",
                        product.getProductType() != null ? product.getProductType().getTypeId() : null,
                        product.getProductType() != null ? product.getProductType().getTypeName() : "N/A",
                        product.getCreatedByUser() != null ? product.getCreatedByUser().getUsername() : "Không rõ",
                        product.getUpdatedByUser() != null ? product.getUpdatedByUser().getUsername() : "Không rõ",
                        product.getCreatedAt(),
                        product.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }


    // 🟢 User tạo sản phẩm mới
    public ProductsDTO createProduct(ProductsDTO dto, String username) {
        User currentUser = usersRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        Product newProduct = productsMapper.toEntity(dto);
        newProduct.setCreatedBy(currentUser.getUserId());  // ✅ Lưu ID người tạo
        newProduct.setUpdatedBy(currentUser.getUserId());  // ✅ Lưu ID người cập nhật

        productsRepository.save(newProduct);
        return productsMapper.toDTO(newProduct);
    }



}
