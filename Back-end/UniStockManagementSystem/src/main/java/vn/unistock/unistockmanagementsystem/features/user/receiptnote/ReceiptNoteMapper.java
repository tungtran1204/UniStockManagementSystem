package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptNote;

@Mapper(componentModel = "spring", uses = {ReceiptNoteDetailMapper.class})
public interface ReceiptNoteMapper {

    @Mapping(source = "createdBy.userId", target = "createdBy")
    @Mapping(source = "details", target = "details")
    @Mapping(source = "purchaseOrder.poId", target = "poId")
    @Mapping(source = "category", target = "category")
    ReceiptNoteDTO toDTO(GoodReceiptNote entity);

    @Mapping(source = "poId", target = "purchaseOrder.poId")
    @Mapping(source = "createdBy", target = "createdBy.userId")
    @Mapping(source = "details", target = "details")
    @Mapping(source = "category", target = "category")
    GoodReceiptNote toEntity(ReceiptNoteDTO dto);
}
