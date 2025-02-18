package vn.unistock.unistockmanagementsystem.features.admin.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Role;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.admin.role.RoleRepository;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper = UserMapper.INSTANCE;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserDTO createUser(UserDTO userDTO) {
        // 1) Chuyển DTO -> Entity
        User user = userMapper.toEntity(userDTO);

        // 2) Mã hóa mật khẩu trước khi lưu
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // ✅ Mã hóa mật khẩu
        }

        // 3) Nạp Role từ DB qua roleIds
        if (userDTO.getRoleIds() != null && !userDTO.getRoleIds().isEmpty()) {
            List<Role> roles = roleRepository.findAllById(userDTO.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        }

        // 4) Lưu user
        user = userRepository.save(user);

        // 5) Trả lại DTO (Không trả về mật khẩu)
        UserDTO responseDTO = userMapper.toDTO(user);
        responseDTO.setPassword(null); // ✅ Không trả về password
        return responseDTO;
    }

    // 🟢 Lấy danh sách Users
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO) // ✅ Dùng Mapper
                .collect(Collectors.toList());
    }

    public UserDTO updateUserStatus(Long id, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        user.setIsActive(isActive);
        userRepository.save(user);

        return userMapper.toDTO(user);
    }

    // 🟢 Lấy User theo ID
    public UserDTO getUserByUserId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));
        return userMapper.toDTO(user); // ✅ Dùng Mapper
    }



    // 🟢 Xóa User theo ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
