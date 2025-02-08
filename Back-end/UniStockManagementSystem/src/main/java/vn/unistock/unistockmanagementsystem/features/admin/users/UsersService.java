package vn.unistock.unistockmanagementsystem.features.admin.users;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Role;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.admin.roles.RolesRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsersService {
    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;
    private final UsersMapper usersMapper = UsersMapper.INSTANCE;

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

    // 🟢 Tạo User mới với Role
    public UsersDTO createUser(UsersDTO usersDTO, Long roleId) {
        Role role = rolesRepository.findByRoleId(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role không tồn tại"));

        User newUser = usersMapper.toEntity(usersDTO); // ✅ Dùng Mapper
        newUser.setRole(role);
        usersRepository.save(newUser);

        return usersMapper.toDTO(newUser);
    }

    // 🟢 Cập nhật thông tin User
    public UsersDTO updateUser(Long id, UsersDTO usersDTO, Long roleId) {
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        Role role = rolesRepository.findByRoleId(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role không tồn tại"));

        user.setUsername(usersDTO.getUsername());
        user.setFullname(usersDTO.getFullname());
        user.setRole(role);
        user.setIsActive(usersDTO.getIsActive());

        usersRepository.save(user);
        return usersMapper.toDTO(user); // ✅ Dùng Mapper
    }

    // 🟢 Xóa User theo ID
    public void deleteUser(Long id) {
        usersRepository.deleteById(id);
    }
}
