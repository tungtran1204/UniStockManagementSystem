package vn.unistock.unistockmanagementsystem.features.admin.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "roleIds", expression = "java(user.getRoles().stream().map(r -> r.getRoleId()).collect(java.util.stream.Collectors.toSet()))")
    @Mapping(target = "roleNames", expression = "java(user.getRoles().stream().map(r -> r.getRoleName()).collect(java.util.stream.Collectors.toSet()))")
    @Mapping(target = "password", ignore = false)
    UserDTO toDTO(User user);

    // Khi chuyển DTO -> Entity, ta tạm ignore role => ta sẽ set role thủ công ở service
    @Mapping(target = "roles", ignore = true)
    User toEntity(UserDTO dto);
}
