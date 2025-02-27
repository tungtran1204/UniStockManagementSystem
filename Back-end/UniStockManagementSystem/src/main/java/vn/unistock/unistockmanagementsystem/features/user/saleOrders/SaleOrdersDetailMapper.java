package vn.unistock.unistockmanagementsystem.features.user.saleOrders;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.SalesOrderDetail;

@Mapper(componentModel = "spring")
public interface SaleOrdersDetailMapper {

    SaleOrdersDetailMapper INSTANCE = Mappers.getMapper(SaleOrdersDetailMapper.class);

    @Mapping(source = "orderDetailId", target = "orderDetailId")
    @Mapping(source = "salesOrder.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "unitPrice", target = "unitPrice")
    @Mapping(source = "discount", target = "discount")
    @Mapping(target = "lineTotal", expression = "java(calculateLineTotal(detail))")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "updatedAt", target = "updatedAt")
    @Mapping(source = "updatedBy", target = "updatedBy")
    SalesOrderDetailDTO toDTO(SalesOrderDetail detail);

    @Mapping(source = "orderDetailId", target = "orderDetailId")
    @Mapping(target = "salesOrder", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "unitPrice", target = "unitPrice")
    @Mapping(source = "discount", target = "discount")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(source = "updatedAt", target = "updatedAt")
    @Mapping(source = "updatedBy", target = "updatedBy")
    SalesOrderDetail toEntity(SalesOrderDetailDTO dto);

    // Helper method to calculate line total
    default Double calculateLineTotal(SalesOrderDetail detail) {
        if (detail == null || detail.getUnitPrice() == null) {
            return 0.0;
        }

        Double total = detail.getQuantity() * detail.getUnitPrice();
        if (detail.getDiscount() != null) {
            total -= detail.getDiscount();
        }
        return total;
    }
}
