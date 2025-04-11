package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrderDetail;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface SaleOrdersDetailMapper {

    SaleOrdersDetailMapper INSTANCE = Mappers.getMapper(SaleOrdersDetailMapper.class);

    // Ánh xạ từ SalesOrderDetail (Entity) → SalesOrderDetailDTO (DTO)
    @Mapping(source = "orderDetailId", target = "orderDetailId")
    @Mapping(source = "salesOrder.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.unit.unitName", target = "unitName")
    @Mapping(source = "product.productCode",  target = "productCode")
    @Mapping(source = "remainingQuantity", target = "remainingQuantity")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "receivedQuantity", target = "receivedQuantity")
    SalesOrderDetailDTO toDTO(SalesOrderDetail entity);

    default List<SalesOrderDetailDTO> toDTOList(List<SalesOrderDetail> entityList) {
        return entityList != null
                ? entityList.stream().map(this::toDTO).collect(Collectors.toList())
                : null;
    }

    // Ánh xạ từ SalesOrderDetailDTO (DTO) → SalesOrderDetail (Entity)
    @Mapping(source = "productId", target = "product.productId")
    @Mapping(source = "remainingQuantity", target = "remainingQuantity")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(target = "receivedQuantity", expression = "java(dto.getReceivedQuantity() == null ? 0 : dto.getReceivedQuantity())")

    @Mapping(source = "productCode",  target = "product.productCode")
    SalesOrderDetail toEntity(SalesOrderDetailDTO dto);

    default List<SalesOrderDetail> toEntityList(List<SalesOrderDetailDTO> dtoList) {
        return dtoList != null
                ? dtoList.stream().map(this::toEntity).collect(Collectors.toList())
                : null;
    }
}
