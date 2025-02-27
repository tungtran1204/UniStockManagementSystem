package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrderDetail;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SaleOrdersDetailMapper {

    SaleOrdersDetailMapper INSTANCE = Mappers.getMapper(SaleOrdersDetailMapper.class);

    @Mapping(source = "orderDetailId", target = "orderDetailId")
    @Mapping(source = "salesOrder.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.unit.unitName", target = "unitName")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "updatedAt", target = "updatedAt")
    @Mapping(source = "updatedBy", target = "updatedBy")
    SalesOrderDetailDTO toDTO(SalesOrderDetail entity);

    List<SalesOrderDetailDTO> toDTOList(List<SalesOrderDetail> entityList);

    @Mapping(source = "productId", target = "product.productId")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "updatedAt", target = "updatedAt")
    @Mapping(source = "updatedBy", target = "updatedBy")
    SalesOrderDetail toEntity(SalesOrderDetailDTO dto);

    List<SalesOrderDetail> toEntityList(List<SalesOrderDetailDTO> dtoList);
}


