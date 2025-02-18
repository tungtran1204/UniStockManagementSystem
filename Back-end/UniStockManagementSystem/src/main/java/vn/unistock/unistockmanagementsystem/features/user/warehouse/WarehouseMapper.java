package vn.unistock.unistockmanagementsystem.features.user.warehouse;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.Warehouse;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {
    WarehouseMapper INSTANCE = Mappers.getMapper(WarehouseMapper.class);

    Warehouse toEntity(WarehouseDTO warehouse);
    WarehouseDTO toDto(Warehouse warehouse);

}
