package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import org.mapstruct.Mapper;
import vn.unistock.unistockmanagementsystem.entities.GoodReceiptNote;

@Mapper(componentModel = "spring")
public interface ReceiptNoteMapper {
    ReceiptNoteDTO toDTO(GoodReceiptNote entity);

    GoodReceiptNote toEntity(ReceiptNoteDTO dto);
}
