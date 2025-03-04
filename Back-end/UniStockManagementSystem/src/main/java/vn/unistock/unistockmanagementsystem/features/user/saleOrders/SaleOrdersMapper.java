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

    // 🟢 **Ánh xạ từ `SalesOrder` (Entity) → `SaleOrdersDTO`**
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "orderCode", target = "orderCode") // ✅ Thêm mapping cho orderCode
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

    // 🟢 **Ánh xạ từ `SaleOrdersDTO` → `SalesOrder` (Entity)**
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "orderCode", target = "orderCode") // ✅ Thêm mapping cho orderCode
    @Mapping(source = "partnerId", target = "partner.partnerId")
    @Mapping(source = "partnerName", target = "partner.partnerName")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "orderDate", target = "orderDate")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "orderDetails", target = "details")
    SalesOrder toEntity(SaleOrdersDTO saleOrdersDTO);

    default List<SalesOrder> toEntityList(List<SaleOrdersDTO> saleOrdersDTOs) {
        return saleOrdersDTOs != null
                ? saleOrdersDTOs.stream().map(this::toEntity).collect(Collectors.toList())
                : null;
    }
}
