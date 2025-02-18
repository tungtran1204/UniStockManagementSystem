package vn.unistock.unistockmanagementsystem.features.user.products;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.Product;

@Mapper(componentModel = "spring")
public interface ProductsMapper {
    ProductsMapper INSTANCE = Mappers.getMapper(ProductsMapper.class);

    @Mapping(source = "productId", target = "productId")
    @Mapping(source = "productCode", target = "productCode")
    @Mapping(source = "productName", target = "productName")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "unit.unitId", target = "unitId")
    @Mapping(source = "unit.unitName", target = "unitName")
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "updatedBy", target = "updatedBy")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "updatedAt", target = "updatedAt")
    ProductsDTO toDTO(Product product);

    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "productType", ignore = true)
    @Mapping(source = "productId", target = "productId")
    @Mapping(source = "productCode", target = "productCode")
    @Mapping(source = "productName", target = "productName")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "updatedBy", target = "updatedBy")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "updatedAt", target = "updatedAt")
    Product toEntity(ProductsDTO dto);
}