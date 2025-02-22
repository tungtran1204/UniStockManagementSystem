package vn.unistock.unistockmanagementsystem.features.user.products;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductsDTO {
    
    private Long productId;

    @NotBlank(message = "Mã sản phẩm không được trống")
    private String productCode;
    
    @NotBlank(message = "Tên sản phẩm không được trống")
    private String productName;
    
    @NotNull(message = "Đơn vị không được trống")
    private Long unitId;
    private String unitName;
    
    @NotNull(message = "Dòng sản phẩm không được trống")
    private Long typeId;
    private String typeName;
    
    @NotNull(message = "Giá không được trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private Double price;
    
    private String description;
    private String imageUrl;
    private Boolean isProductionActive;
    private MultipartFile image;
}