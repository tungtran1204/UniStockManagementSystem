package vn.unistock.unistockmanagementsystem.features.admin.users;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Role;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.admin.roles.RolesRepository;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsersService {
    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;
    private final UsersMapper usersMapper = UsersMapper.INSTANCE;


    public UsersDTO createUser(UsersDTO userDTO) {
        // 1) Chuyển DTO -> Entity (trừ trường roles vì ignore)
        User user = usersMapper.toEntity(userDTO);

        // 2) Nạp Role từ DB qua roleIds
        if (userDTO.getRoleIds() != null && !userDTO.getRoleIds().isEmpty()) {
            List<Role> roles = rolesRepository.findAllById(userDTO.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        }
        // 3) Lưu user
        user = usersRepository.save(user);

        // 4) Trả lại DTO
        return usersMapper.toDTO(user);
    }

    // 🟢 Lấy danh sách Users
    public List<UsersDTO> getAllUsers() {
        return usersRepository.findAll().stream()
                .map(usersMapper::toDTO) // ✅ Dùng Mapper
                .collect(Collectors.toList());
    }

    public UsersDTO updateUserStatus(Long id, Boolean isActive) {
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        user.setIsActive(isActive);
        usersRepository.save(user);

        return usersMapper.toDTO(user);
    }

    // 🟢 Lấy User theo ID
    public UsersDTO getUserByUserId(Long id) {
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));
        return usersMapper.toDTO(user); // ✅ Dùng Mapper
    }



    // 🟢 Xóa User theo ID
    public void deleteUser(Long id) {
        usersRepository.deleteById(id);
    }
}
