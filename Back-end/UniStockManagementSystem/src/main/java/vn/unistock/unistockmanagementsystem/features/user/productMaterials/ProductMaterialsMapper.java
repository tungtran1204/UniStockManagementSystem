package vn.unistock.unistockmanagementsystem.features.user.productMaterials;

import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.ProductMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMaterialsMapper {
    ProductMaterialsMapper INSTANCE = Mappers.getMapper(ProductMaterialsMapper.class);

    @Mapping(source = "material.materialId", target = "materialId")
    @Mapping(source = "material.materialCode", target = "materialCode")
    @Mapping(source = "material.materialName", target = "materialName")
    ProductMaterialsDTO toDTO(ProductMaterial productMaterial);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "material", ignore = true)
    ProductMaterial toEntity(ProductMaterialsDTO dto);
}
