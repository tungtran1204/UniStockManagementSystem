package vn.unistock.unistockmanagementsystem.features.admin.users;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.unistock.unistockmanagementsystem.entities.User;

@Mapper(componentModel = "spring") // 🟢 Dùng Spring Boot Dependency Injection
public interface UsersMapper {
    UsersMapper INSTANCE = Mappers.getMapper(UsersMapper.class);

    // 🟢 Chuyển từ Entity -> DTO
    @Mapping(source = "userId", target = "userId")  // 🟢 Đảm bảo ánh xạ ID
    @Mapping(source = "role.roleId", target = "roleId")   // Lấy ID của Role
    @Mapping(source = "role.roleName", target = "roleName") // Lấy tên của Role
    UsersDTO toDTO(User user);

    // 🟢 Chuyển từ DTO -> Entity
    @Mapping(target = "password", ignore = true) // Không gán password
    User toEntity(UsersDTO usersDTO);
}

