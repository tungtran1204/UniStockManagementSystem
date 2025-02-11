package vn.unistock.unistockmanagementsystem.features.user.products;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.Product;

@Mapper(componentModel = "spring") // Dùng DI của Spring Boot
public interface ProductsMapper {
    ProductsMapper INSTANCE = Mappers.getMapper(ProductsMapper.class);

    @Mapping(source = "unit.unitId", target = "unitId")
    @Mapping(source = "productType.typeId", target = "productTypeId")
    ProductsDTO toDTO(Product product);

    Product toEntity(ProductsDTO productsDTO);
}