package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

@Mapper(componentModel = "spring")
public interface SaleOrdersMapper {

    SaleOrdersMapper INSTANCE = Mappers.getMapper(SaleOrdersMapper.class);

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(target = "customerName", ignore = true) // Lấy từ JOIN trong service
    @Mapping(source = "totalAmount", target = "totalAmount")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")

    //@Mapping(source = "createdAt", target = "createdAt")
    //@Mapping(source = "updatedAt", target = "updatedAt")
    //@Mapping(source = "createdBy", target = "createdBy")
    SaleOrdersDTO toDTO(SalesOrder salesOrder);

    SalesOrder toEntity(SaleOrdersDTO saleOrdersDTO);
}
