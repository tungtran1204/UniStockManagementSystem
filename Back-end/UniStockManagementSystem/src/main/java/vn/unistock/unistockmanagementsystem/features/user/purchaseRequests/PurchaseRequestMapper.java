package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequestDetail;

@Mapper(componentModel = "spring")
public interface PurchaseRequestMapper {
    PurchaseRequestMapper INSTANCE = Mappers.getMapper(PurchaseRequestMapper.class);

    @Mapping(source = "salesOrder.orderCode", target = "orderCode", defaultExpression = "java(null)")
    @Mapping(target = "productName", expression = "java(purchaseRequest.getSalesOrder() != null && purchaseRequest.getSalesOrder().getDetails().size() == 1 ? purchaseRequest.getSalesOrder().getDetails().get(0).getProduct().getProductName() : \"Multiple Products\")")
    PurchaseRequestDTO toDTO(PurchaseRequest purchaseRequest);

    @Mapping(source = "salesOrder.orderCode", target = "orderCode", defaultExpression = "java(null)")
    PurchaseRequestDetailDTO toDetailDTO(PurchaseRequest purchaseRequest);

    @Mapping(source = "material.materialId", target = "materialId")
    @Mapping(source = "material.materialCode", target = "materialCode")
    @Mapping(source = "material.materialName", target = "materialName")
    @Mapping(source = "unit.unitName", target = "unitName")
    MaterialItemDTO toMaterialItemDTO(PurchaseRequestDetail detail);
}