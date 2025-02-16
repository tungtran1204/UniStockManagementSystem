package vn.unistock.unistockmanagementsystem.features.admin.users;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.User;

@Mapper(componentModel = "spring")
public interface UsersMapper {
    UsersMapper INSTANCE = Mappers.getMapper(UsersMapper.class);

    @Mapping(target = "roleIds", expression = "java(user.getRoles().stream().map(r -> r.getRoleId()).collect(java.util.stream.Collectors.toSet()))")
    @Mapping(target = "roleNames", expression = "java(user.getRoles().stream().map(r -> r.getRoleName()).collect(java.util.stream.Collectors.toSet()))")
    @Mapping(target = "password", ignore = false)
    UsersDTO toDTO(User user);

    // Khi chuyển DTO -> Entity, ta tạm ignore roles => ta sẽ set roles thủ công ở service
    @Mapping(target = "roles", ignore = true)
    User toEntity(UsersDTO dto);
}
