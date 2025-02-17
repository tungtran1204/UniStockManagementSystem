package vn.unistock.unistockmanagementsystem.features.user.products;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.Product;

@Mapper(componentModel = "spring")
public interface ProductsMapper {
    ProductsMapper INSTANCE = Mappers.getMapper(ProductsMapper.class);

    @Mapping(source = "unit.unitId", target = "unitId")
    @Mapping(source = "unit.unitName", target = "unitName")
    @Mapping(source = "productType.typeId", target = "productTypeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "createdByUser.username", target = "createdByUsername")
    @Mapping(source = "updatedByUser.username", target = "updatedByUsername")
    ProductsDTO toDTO(Product product);

    Product toEntity(ProductsDTO dto);
}
