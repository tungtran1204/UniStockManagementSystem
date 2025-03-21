package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;

@Mapper(componentModel = "spring", uses = {PurchaseRequestDetailMapper.class})
public interface PurchaseRequestMapper {

    @Mapping(source = "salesOrder.orderCode", target = "saleOrderCode")
    @Mapping(source = "notes", target = "notes")
    @Mapping(source = "purchaseRequestDetails", target = "purchaseRequestDetails")
    PurchaseRequestDTO toDTO(PurchaseRequest entity);

    @Mapping(source = "notes", target = "notes")
    @Mapping(source = "purchaseRequestDetails", target = "purchaseRequestDetails")
    PurchaseRequest toEntity(PurchaseRequestDTO dto);
}