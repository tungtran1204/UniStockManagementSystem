package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.unistock.unistockmanagementsystem.entities.GoodIssueNote;

@Mapper(componentModel = "spring", uses = {IssueNoteDetailMapper.class})
public interface IssueNoteMapper {

    @Mapping(source = "createdBy.userId", target = "createdBy")
    @Mapping(source = "details", target = "details")
    @Mapping(source = "salesOrder.orderId", target = "soId")
    @Mapping(source = "category", target = "category")
    IssueNoteDTO toDTO(GoodIssueNote entity);

    @Mapping(source = "soId", target = "salesOrder.orderId")
    @Mapping(source = "createdBy", target = "createdBy.userId")
    @Mapping(source = "details", target = "details")
    @Mapping(source = "category", target = "category")
    GoodIssueNote toEntity(IssueNoteDTO dto);
}