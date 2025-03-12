package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.unistock.unistockmanagementsystem.entities.PurchaseRequest;

@Mapper(componentModel = "spring", uses = {PurchaseRequestDetailMapper.class})
public interface PurchaseRequestMapper {

    @Mapping(source = "partner.partnerId", target = "partnerId")
    @Mapping(source = "partner.partnerName", target = "partnerName")
    @Mapping(source = "partner.address", target = "address")
    @Mapping(source = "partner.phone", target = "phoneNumber")
    @Mapping(source = "partner.contactName", target = "contactPerson")
    @Mapping(source = "notes", target = "notes")
    @Mapping(source = "purchaseRequestDetails", target = "purchaseRequestDetails")
    PurchaseRequestDTO toDTO(PurchaseRequest entity);

    @Mapping(source = "partnerId", target = "partner.partnerId")
    @Mapping(source = "notes", target = "notes")
    @Mapping(source = "purchaseRequestDetails", target = "purchaseRequestDetails")
    PurchaseRequest toEntity(PurchaseRequestDTO dto);
}