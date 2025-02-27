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
public class    ProductsDTO {
    
    private Long productId;

    private String productCode;
    
    private String productName;
    
    private Long unitId;
    private String unitName;
    
    private Long typeId;
    private String typeName;

    private String description;
    private String imageUrl;
    private Boolean isProductionActive;
    private MultipartFile image;
}