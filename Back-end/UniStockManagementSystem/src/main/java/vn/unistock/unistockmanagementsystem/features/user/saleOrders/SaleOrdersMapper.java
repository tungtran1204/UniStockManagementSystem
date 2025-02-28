package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

@Mapper(componentModel = "spring", uses = {SaleOrdersDetailMapper.class})
public interface SaleOrdersMapper {

    SaleOrdersMapper INSTANCE = Mappers.getMapper(SaleOrdersMapper.class);

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "partner.partnerId", target = "partnerId")
    @Mapping(source = "partner.partnerName", target = "partnerName") // Will be set in service
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "details", target = "orderDetails")
    SaleOrdersDTO toDTO(SalesOrder salesOrder);

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "partnerName", target = "partner.partnerName")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "orderDetails", target = "details")
        // Handle separately
    SalesOrder toEntity(SaleOrdersDTO saleOrdersDTO);
}
