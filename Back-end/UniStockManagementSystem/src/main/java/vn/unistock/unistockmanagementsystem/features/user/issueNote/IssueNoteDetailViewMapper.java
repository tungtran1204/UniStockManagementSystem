package vn.unistock.unistockmanagementsystem.features.user.issueNote;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.unistock.unistockmanagementsystem.entities.GoodIssueDetail;

@Mapper(componentModel = "spring")
public interface IssueNoteDetailViewMapper {
    @Mapping(source = "warehouse.warehouseId", target = "warehouseId")
    @Mapping(source = "material.materialId", target = "materialId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "unit.unitId", target = "unitId")
    @Mapping(source = "goodIssueNote.ginId", target = "ginId")
    IssueNoteDetailDTO toDTO(GoodIssueDetail entity);

    @Mapping(source = "warehouseId", target = "warehouse.warehouseId")
    @Mapping(source = "materialId", target = "material.materialId")
    @Mapping(source = "productId", target = "product.productId")
    @Mapping(source = "unitId", target = "unit.unitId")
    GoodIssueDetail toEntity(IssueNoteDetailDTO dto);
}