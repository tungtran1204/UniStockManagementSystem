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
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    ProductsDTO toDTO(Product product);

    @Mapping(target = "unit", ignore = true) // ✅ Ignore vì sẽ gán riêng
    @Mapping(target = "productType", ignore = true) // ✅ Ignore vì sẽ gán riêng
    Product toEntity(ProductsDTO dto);
}

