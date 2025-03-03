package vn.unistock.unistockmanagementsystem.features.user.materials;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.Material;

@Mapper(componentModel = "spring")
public interface MaterialsMapper {
    MaterialsMapper INSTANCE = Mappers.getMapper(MaterialsMapper.class);

    @Mapping(source = "unit.unitId", target = "unitId")
    @Mapping(source = "unit.unitName", target = "unitName")
    @Mapping(source = "materialType.materialTypeId", target = "typeId")
    @Mapping(source = "materialType.name", target = "typeName")
    @Mapping(source = "isUsing", target = "isUsing")
    MaterialsDTO toDTO(Material material);

    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "materialType", ignore = true)
    @Mapping(source = "isUsing", target = "isUsing")
    Material toEntity(MaterialsDTO dto);
}