package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

@Mapper(componentModel = "spring")
public interface SaleOrdersMapper {

    SaleOrdersMapper INSTANCE = Mappers.getMapper(SaleOrdersMapper.class);

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "customer.name", target = "custName") // Will be set in service
    @Mapping(source = "totalAmount", target = "totalAmount")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    SaleOrdersDTO toDTO(SalesOrder salesOrder);

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "custName", target = "customer.name")
    @Mapping(source = "totalAmount", target = "totalAmount")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "orderDetails", target = "details") // Handle separately
    SalesOrder toEntity(SaleOrdersDTO saleOrdersDTO);
}
