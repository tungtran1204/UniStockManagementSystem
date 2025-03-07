package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrder;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {SaleOrdersDetailMapper.class})
public interface SaleOrdersMapper {

    SaleOrdersMapper INSTANCE = Mappers.getMapper(SaleOrdersMapper.class);

    // Ánh xạ từ SalesOrder (Entity) → SaleOrdersDTO (DTO)
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "orderCode", target = "orderCode")
    @Mapping(source = "partner.partnerId", target = "partnerId")
    @Mapping(source = "partner.partnerName", target = "partnerName")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "details", target = "orderDetails")
    SaleOrdersDTO toDTO(SalesOrder salesOrder);

    default List<SaleOrdersDTO> toDTOList(List<SalesOrder> salesOrders) {
        return salesOrders != null
                ? salesOrders.stream().map(this::toDTO).collect(Collectors.toList())
                : null;
    }

    // Ánh xạ từ SaleOrdersDTO (DTO) → SalesOrder (Entity)
    // createdByUser sẽ được set tự động trong service (vì user đang đăng nhập)
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "orderCode", target = "orderCode")
    @Mapping(source = "partnerId", target = "partner.partnerId")
    @Mapping(source = "partnerName", target = "partner.partnerName")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "orderDetails", target = "details")
    @Mapping(target = "createdByUser", ignore = true)
    SalesOrder toEntity(SaleOrdersDTO saleOrdersDTO);

    default List<SalesOrder> toEntityList(List<SaleOrdersDTO> saleOrdersDTOs) {
        return saleOrdersDTOs != null
                ? saleOrdersDTOs.stream().map(this::toEntity).collect(Collectors.toList())
                : null;
    }
}
