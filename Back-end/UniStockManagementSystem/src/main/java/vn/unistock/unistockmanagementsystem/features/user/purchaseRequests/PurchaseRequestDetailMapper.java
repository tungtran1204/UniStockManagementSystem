package vn.unistock.unistockmanagementsystem.features.user.purchaseRequests;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.Material;
import vn.unistock.unistockmanagementsystem.entities.PurchaseRequestDetail;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface PurchaseRequestDetailMapper {

    @Mapping(source = "material.materialId", target = "materialId")
    @Mapping(source = "material.materialCode", target = "materialCode")
    @Mapping(source = "material.materialName", target = "materialName")
    @Mapping(source = "material.unit.unitName", target = "unitName") // ✅ Lấy đơn vị từ `Unit`
    @Mapping(source = "quantity", target = "quantity")
    PurchaseRequestDetailDTO toDTO(PurchaseRequestDetail entity);

    List<PurchaseRequestDetailDTO> toDTOList(List<PurchaseRequestDetail> entities);

    @Mapping(source = "materialId", target = "material.materialId")
    @Mapping(source = "quantity", target = "quantity")
    PurchaseRequestDetail toEntity(PurchaseRequestDetailDTO dto);

    List<PurchaseRequestDetail> toEntityList(List<PurchaseRequestDetailDTO> dtos);
}