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

    // 🟢 **Ánh xạ từ `SalesOrderDetail` → `SalesOrderDetailDTO`**
    @Mapping(source = "orderDetailId", target = "orderDetailId")
    @Mapping(source = "salesOrder.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.unit.unitName", target = "unitName")
    @Mapping(source = "quantity", target = "quantity")
    SalesOrderDetailDTO toDTO(SalesOrderDetail entity);

    default List<SalesOrderDetailDTO> toDTOList(List<SalesOrderDetail> entityList) {
        return entityList != null ? entityList.stream().map(this::toDTO).collect(Collectors.toList()) : null;
    }

    // 🟢 **Ánh xạ từ `SalesOrderDetailDTO` → `SalesOrderDetail`**
    @Mapping(source = "productId", target = "product.productId")
    @Mapping(source = "quantity", target = "quantity")
    SalesOrderDetail toEntity(SalesOrderDetailDTO dto);

    default List<SalesOrderDetail> toEntityList(List<SalesOrderDetailDTO> dtoList) {
        return dtoList != null ? dtoList.stream().map(this::toEntity).collect(Collectors.toList()) : null;
    }
}
