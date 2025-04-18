package vn.unistock.unistockmanagementsystem.features.user.issueNote;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.unistock.unistockmanagementsystem.entities.ReceiveOutsource;
import vn.unistock.unistockmanagementsystem.entities.ReceiveOutsourceMaterial;

@Mapper(componentModel = "spring")
public interface ReceiveOutsourceMapper {

    @Mapping(source = "goodIssueNote.ginId", target = "ginId")
    @Mapping(source = "partner.partnerId", target = "partnerId")
    @Mapping(source = "partner.partnerName", target = "partnerName")
    @Mapping(source = "materials", target = "materials")
    ReceiveOutsourceDTO toDTO(ReceiveOutsource entity);

    @Mapping(source = "material.materialId", target = "materialId")
    @Mapping(source = "material.materialCode", target = "materialCode")
    @Mapping(source = "material.materialName", target = "materialName")
    @Mapping(source = "unit.unitId", target = "unitId")
    @Mapping(source = "unit.unitName", target = "unitName")
    @Mapping(source = "warehouse.warehouseId", target = "warehouseId")
    @Mapping(source = "warehouse.warehouseName", target = "warehouseName")
    ReceiveOutsourceMaterialDTO toDTO(ReceiveOutsourceMaterial entity);
}
