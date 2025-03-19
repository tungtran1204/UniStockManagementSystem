package vn.unistock.unistockmanagementsystem.features.admin.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import vn.unistock.unistockmanagementsystem.entities.Role;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.entities.UserDetail;
import vn.unistock.unistockmanagementsystem.features.admin.role.RoleRepository;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserDetailRepository userDetailRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    // Dữ liệu test mẫu
    private User user;
    private UserDTO userDTO;
    private Role role;
    private UserDetail userDetail;
    private UserDetailDTO userDetailDTO;

    @BeforeEach
    void setUp() {
        // Khởi tạo dữ liệu mẫu cho các test
        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("encoded_password");
        user.setIsActive(true);

        role = new Role();
        role.setRoleId(1L);
        role.setRoleName("USER");
        role.setDescription("Vai trò mặc định");
        role.setIsActive(true);

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        userDetail = new UserDetail();
        userDetail.setDetailId(1L);
        userDetail.setUser(user);
        userDetail.setFullname("Test User");
        userDetail.setPhoneNumber("0123456789");
        userDetail.setAddress("Test Address");
        userDetail.setDateOfBirth(LocalDate.of(1990, 1, 1));
        userDetail.setProfilePicture("avatar.jpg");

        user.setUserDetail(userDetail);

        userDetailDTO = new UserDetailDTO();
        userDetailDTO.setFullname("Test User");
        userDetailDTO.setPhoneNumber("0123456789");
        userDetailDTO.setAddress("Test Address");
        userDetailDTO.setDateOfBirth(LocalDate.of(1990, 1, 1));
        userDetailDTO.setProfilePicture("avatar.jpg");

        userDTO = new UserDTO();
        userDTO.setUserId(1L);
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");
        userDTO.setPassword("password");
        userDTO.setIsActive(true);
        userDTO.setRoleIds(Set.of(1L));
        userDTO.setRoleNames(Set.of("USER"));
        userDTO.setUserDetail(userDetailDTO);
    }

    @Nested
    @DisplayName("createUser Tests")
    class CreateUserTests {

        @Test
        @DisplayName("TC01: Tạo user với dữ liệu hợp lệ")
        void createUserWithValidData() {
            // Arrange
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.createUser(userDTO);

            // Assert
            assertNotNull(result);
            assertEquals(userDTO.getUserId(), result.getUserId());
            assertEquals(userDTO.getUsername(), result.getUsername());
            assertEquals(userDTO.getEmail(), result.getEmail());
            assertNull(result.getPassword());

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper).toEntity(userDTO);
            verify(passwordEncoder).encode(userDTO.getPassword());
            verify(roleRepository).findByRoleName("USER");
            verify(userRepository).save(user);
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC02: Tạo user với email đã tồn tại")
        void createUserWithExistingEmail() {
            // Arrange
            when(userRepository.existsByEmail(anyString())).thenReturn(true);

            // Act & Assert
            ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                    () -> userService.createUser(userDTO));
            assertEquals("Email đã tồn tại!", exception.getReason());

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper, never()).toEntity(any(UserDTO.class));
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("TC03: Tạo user với role không hợp lệ")
        void createUserWithInvalidRoles() {
            // Arrange
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));
            when(roleRepository.findAllById(anySet())).thenReturn(Collections.emptyList());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.createUser(userDTO));
            assertEquals("Danh sách role không hợp lệ!", exception.getMessage());

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper).toEntity(userDTO);
            verify(passwordEncoder).encode(userDTO.getPassword());
            verify(roleRepository).findByRoleName("USER");
            verify(roleRepository).findAllById(userDTO.getRoleIds());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("TC04: Tạo user không có password")
        void createUserWithoutPassword() {
            // Arrange
            userDTO.setPassword(null);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
            when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.createUser(userDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper).toEntity(userDTO);
            verify(passwordEncoder, never()).encode(anyString());
            verify(roleRepository).findByRoleName("USER");
            verify(userRepository).save(user);
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC05: Tạo user không có role")
        void createUserWithoutRoles() {
            // Arrange
            userDTO.setRoleIds(null);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.createUser(userDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper).toEntity(userDTO);
            verify(passwordEncoder).encode(userDTO.getPassword());
            verify(roleRepository).findByRoleName("USER");
            verify(roleRepository, never()).findAllById(anySet());
            verify(userRepository).save(user);
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC06: Tạo user không có thông tin chi tiết")
        void createUserWithoutUserDetail() {
            // Arrange
            userDTO.setUserDetail(null);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.createUser(userDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper).toEntity(userDTO);
            verify(passwordEncoder).encode(userDTO.getPassword());
            verify(roleRepository).findByRoleName("USER");
            verify(userRepository).save(user);
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC07: Tạo user với role USER không tồn tại")
        void createUserWithNonExistingUserRole() {
            // Arrange
            Role newRole = new Role();
            newRole.setRoleName("USER");
            newRole.setDescription("Vai trò mặc định cho tất cả user");
            newRole.setIsActive(true);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(roleRepository.findByRoleName("USER")).thenReturn(Optional.empty());
            when(roleRepository.save(any(Role.class))).thenReturn(newRole);
            when(roleRepository.findAllById(anySet())).thenReturn(List.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.createUser(userDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).existsByEmail(userDTO.getEmail());
            verify(userMapper).toEntity(userDTO);
            verify(passwordEncoder).encode(userDTO.getPassword());
            verify(roleRepository).findByRoleName("USER");
            verify(roleRepository).save(any(Role.class));
            verify(roleRepository).findAllById(userDTO.getRoleIds());
            verify(userRepository).save(user);
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userMapper).toDTO(user);
        }
    }

    @Nested
    @DisplayName("updateUser Tests")
    class UpdateUserTests {

        @Test
        @DisplayName("TC08: Cập nhật tất cả thông tin người dùng")
        void updateAllUserInfo() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(anyString())).thenReturn("new_encoded_password");
            when(roleRepository.findAllById(anySet())).thenReturn(List.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setEmail("new@example.com");
            updatedUserDTO.setPassword("newpassword");
            updatedUserDTO.setIsActive(false);
            updatedUserDTO.setRoleIds(Set.of(1L));

            UserDetailDTO updatedUserDetailDTO = new UserDetailDTO();
            updatedUserDetailDTO.setFullname("New Name");
            updatedUserDetailDTO.setPhoneNumber("9876543210");
            updatedUserDetailDTO.setAddress("New Address");
            updatedUserDetailDTO.setDateOfBirth(LocalDate.of(1995, 5, 5));
            updatedUserDTO.setUserDetail(updatedUserDetailDTO);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(passwordEncoder).encode("newpassword");
            verify(roleRepository).findAllById(updatedUserDTO.getRoleIds());
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC09: Cập nhật chỉ email")
        void updateOnlyEmail() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setEmail("new@example.com");
            updatedUserDTO.setIsActive(true);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(passwordEncoder, never()).encode(anyString());
            verify(roleRepository, never()).findAllById(anySet());
            verify(userDetailRepository, never()).save(any(UserDetail.class));
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC10: Cập nhật chỉ mật khẩu")
        void updateOnlyPassword() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(anyString())).thenReturn("new_encoded_password");
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setPassword("newpassword");
            updatedUserDTO.setIsActive(true);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(passwordEncoder).encode("newpassword");
            verify(roleRepository, never()).findAllById(anySet());
            verify(userDetailRepository, never()).save(any(UserDetail.class));
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC11: Cập nhật chỉ trạng thái hoạt động")
        void updateOnlyActiveStatus() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setIsActive(false);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);
            assertEquals(false, user.getIsActive());

            // Verify
            verify(userRepository).findById(1L);
            verify(passwordEncoder, never()).encode(anyString());
            verify(roleRepository, never()).findAllById(anySet());
            verify(userDetailRepository, never()).save(any(UserDetail.class));
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC12: Cập nhật chỉ vai trò")
        void updateOnlyRoles() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(roleRepository.findAllById(anySet())).thenReturn(List.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setRoleIds(Set.of(1L));
            updatedUserDTO.setIsActive(true);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(passwordEncoder, never()).encode(anyString());
            verify(roleRepository).findAllById(updatedUserDTO.getRoleIds());
            verify(userDetailRepository, never()).save(any(UserDetail.class));
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC13: Cập nhật chỉ thông tin chi tiết")
        void updateOnlyUserDetails() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setIsActive(true);

            UserDetailDTO updatedUserDetailDTO = new UserDetailDTO();
            updatedUserDetailDTO.setFullname("New Name");
            updatedUserDetailDTO.setPhoneNumber("9876543210");
            updatedUserDetailDTO.setAddress("New Address");
            updatedUserDetailDTO.setDateOfBirth(LocalDate.of(1995, 5, 5));
            updatedUserDTO.setUserDetail(updatedUserDetailDTO);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(passwordEncoder, never()).encode(anyString());
            verify(roleRepository, never()).findAllById(anySet());
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC14: Cập nhật người dùng không tồn tại")
        void updateNonExistentUser() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setEmail("new@example.com");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.updateUser(999L, updatedUserDTO));
            assertEquals("User không tồn tại!", exception.getMessage());

            // Verify
            verify(userRepository).findById(999L);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("TC15: Cập nhật với vai trò không hợp lệ")
        void updateWithInvalidRoles() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(roleRepository.findAllById(anySet())).thenReturn(Collections.emptyList());

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setRoleIds(Set.of(999L));
            updatedUserDTO.setIsActive(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.updateUser(1L, updatedUserDTO));
            assertEquals("Danh sách role không hợp lệ!", exception.getMessage());

            // Verify
            verify(userRepository).findById(1L);
            verify(roleRepository).findAllById(updatedUserDTO.getRoleIds());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("TC16: Cập nhật user không có UserDetail")
        void updateUserWithoutExistingUserDetail() {
            // Arrange
            User userWithoutDetail = new User();
            userWithoutDetail.setUserId(1L);
            userWithoutDetail.setUsername("testuser");
            userWithoutDetail.setEmail("test@example.com");
            userWithoutDetail.setPassword("encoded_password");
            userWithoutDetail.setIsActive(true);
            userWithoutDetail.setRoles(Set.of(role));
            userWithoutDetail.setUserDetail(null);

            when(userRepository.findById(anyLong())).thenReturn(Optional.of(userWithoutDetail));
            when(userRepository.save(any(User.class))).thenReturn(userWithoutDetail);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setIsActive(true);

            UserDetailDTO updatedUserDetailDTO = new UserDetailDTO();
            updatedUserDetailDTO.setFullname("New Name");
            updatedUserDTO.setUserDetail(updatedUserDetailDTO);

            // Act
            UserDTO result = userService.updateUser(1L, updatedUserDTO);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(userDetailRepository).save(any(UserDetail.class));
            verify(userRepository).save(userWithoutDetail);
            verify(userMapper).toDTO(userWithoutDetail);
        }
    }

    @Nested
    @DisplayName("getAllUsers Tests")
    class GetAllUsersTests {

        @Test
        @DisplayName("TC17: Lấy danh sách người dùng với phân trang mặc định")
        void getAllUsersWithDefaultPagination() {
            // Arrange
            List<User> users = Arrays.asList(user);
            Page<User> userPage = new PageImpl<>(users);

            when(userRepository.findAll(any(Pageable.class))).thenReturn(userPage);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            Page<UserDTO> result = userService.getAllUsers(0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getTotalElements());

            // Verify
            verify(userRepository).findAll(PageRequest.of(0, 10));
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC18: Lấy danh sách người dùng với phân trang tùy chỉnh")
        void getAllUsersWithCustomPagination() {
            // Arrange
            List<User> users = Arrays.asList(user);
            Page<User> userPage = new PageImpl<>(users);

            when(userRepository.findAll(any(Pageable.class))).thenReturn(userPage);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            Page<UserDTO> result = userService.getAllUsers(2, 5);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findAll(PageRequest.of(2, 5));
            verify(userMapper).toDTO(user);
        }

        @Test
        @DisplayName("TC19: Lấy danh sách người dùng khi không có người dùng nào")
        void getAllUsersWhenEmpty() {
            // Arrange
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList());

            when(userRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

            // Act
            Page<UserDTO> result = userService.getAllUsers(0, 10);

            // Assert
            assertNotNull(result);
            assertEquals(0, result.getTotalElements());
            assertTrue(result.isEmpty());

            // Verify
            verify(userRepository).findAll(PageRequest.of(0, 10));
            verify(userMapper, never()).toDTO(any(User.class));
        }

        @Test
        @DisplayName("TC20: Lấy danh sách người dùng với kích thước trang là 0")
        void getAllUsersWithZeroPageSize() {
            // Arrange
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList());

            when(userRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

            // Act
            Page<UserDTO> result = userService.getAllUsers(0, 0);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findAll(PageRequest.of(0, 0));
        }

        @Test
        @DisplayName("TC21: Lấy danh sách người dùng với số trang âm")
        void getAllUsersWithNegativePage() {
            // Arrange
            Page<User> userPage = new PageImpl<>(List.of(user));

            when(userRepository.findAll(any(Pageable.class))).thenReturn(userPage);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            Page<UserDTO> result = userService.getAllUsers(-1, 10);

            // Assert
            assertNotNull(result);

            // Verify - Spring's PageRequest internally converts negative page to 0
            verify(userRepository).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("updateUserStatus Tests")
    class UpdateUserStatusTests {

        @Test
        @DisplayName("TC22: Kích hoạt người dùng")
        void activateUser() {
            // Arrange
            user.setIsActive(false);

            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.updateUserStatus(1L, true);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);

            assertTrue(user.getIsActive());
        }

        @Test
        @DisplayName("TC23: Vô hiệu hóa người dùng")
        void deactivateUser() {
            // Arrange
            user.setIsActive(true);

            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.updateUserStatus(1L, false);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);

            assertFalse(user.getIsActive());
        }

        @Test
        @DisplayName("TC24: Cập nhật trạng thái người dùng không tồn tại")
        void updateStatusOfNonExistentUser() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.updateUserStatus(999L, true));
            assertEquals("User không tồn tại", exception.getMessage());

            // Verify
            verify(userRepository).findById(999L);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("TC25: Cập nhật trạng thái giống với trạng thái hiện tại")
        void updateStatusToSameValue() {
            // Arrange
            user.setIsActive(true);

            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.updateUserStatus(1L, true);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(userRepository).save(user);
            verify(userMapper).toDTO(user);

            assertTrue(user.getIsActive());
        }
    }

    @Nested
    @DisplayName("getUserByUserId Tests")
    class GetUserByUserIdTests {

        @Test
        @DisplayName("TC26: Lấy thông tin người dùng tồn tại có thông tin chi tiết")
        void getUserWithUserDetail() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);
            when(userMapper.toUserDetailDTO(any(UserDetail.class))).thenReturn(userDetailDTO);

            // Act
            UserDTO result = userService.getUserByUserId(1L);

            // Assert
            assertNotNull(result);
            assertNotNull(result.getUserDetail());

            // Verify
            verify(userRepository).findById(1L);
            verify(userMapper).toDTO(user);
            verify(userMapper).toUserDetailDTO(user.getUserDetail());
        }

        @Test
        @DisplayName("TC27: Lấy thông tin người dùng tồn tại không có thông tin chi tiết")
        void getUserWithoutUserDetail() {
            // Arrange
            User userWithoutDetail = new User();
            userWithoutDetail.setUserId(1L);
            userWithoutDetail.setUserDetail(null);

            when(userRepository.findById(anyLong())).thenReturn(Optional.of(userWithoutDetail));
            when(userMapper.toDTO(any(User.class))).thenReturn(userDTO);

            // Act
            UserDTO result = userService.getUserByUserId(1L);

            // Assert
            assertNotNull(result);

            // Verify
            verify(userRepository).findById(1L);
            verify(userMapper).toDTO(userWithoutDetail);
            verify(userMapper, never()).toUserDetailDTO(any(UserDetail.class));
        }

        @Test
        @DisplayName("TC28: Lấy thông tin người dùng không tồn tại")
        void getNonExistentUser() {
            // Arrange
            when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.getUserByUserId(999L));
            assertEquals("User không tồn tại", exception.getMessage());

            // Verify
            verify(userRepository).findById(999L);
            verify(userMapper, never()).toDTO(any(User.class));
        }

        @Test
        @DisplayName("TC29: Lấy thông tin người dùng với ID là 0")
        void getUserWithZeroId() {
            // Arrange
            when(userRepository.findById(0L)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.getUserByUserId(0L));
            assertEquals("User không tồn tại", exception.getMessage());

            // Verify
            verify(userRepository).findById(0L);
        }

        @Test
        @DisplayName("TC30: Lấy thông tin người dùng với ID âm")
        void getUserWithNegativeId() {
            // Arrange
            when(userRepository.findById(-1L)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> userService.getUserByUserId(-1L));
            assertEquals("User không tồn tại", exception.getMessage());

            // Verify
            verify(userRepository).findById(-1L);
        }
    }

    @Nested
    @DisplayName("checkEmailExists Tests")
    class CheckEmailExistsTests {

        @Test
        @DisplayName("TC31: Kiểm tra email tồn tại")
        void checkExistingEmail() {
            // Arrange
            when(userRepository.existsByEmail(anyString())).thenReturn(true);

            // Act
            boolean result = userService.checkEmailExists("test@example.com");

            // Assert
            assertTrue(result);

            // Verify
            verify(userRepository).existsByEmail("test@example.com");
        }

        @Test
        @DisplayName("TC32: Kiểm tra email không tồn tại")
        void checkNonExistingEmail() {
            // Arrange
            when(userRepository.existsByEmail(anyString())).thenReturn(false);

            // Act
            boolean result = userService.checkEmailExists("new@example.com");

            // Assert
            assertFalse(result);

            // Verify
            verify(userRepository).existsByEmail("new@example.com");
        }

        @Test
        @DisplayName("TC33: Kiểm tra email null")
        void checkNullEmail() {
            // Arrange
            when(userRepository.existsByEmail(null)).thenReturn(false);

            // Act
            boolean result = userService.checkEmailExists(null);

            // Assert
            assertFalse(result);

            // Verify
            verify(userRepository).existsByEmail(null);
        }

        @Test
        @DisplayName("TC34: Kiểm tra email rỗng")
        void checkEmptyEmail() {
            // Arrange
            when(userRepository.existsByEmail("")).thenReturn(false);

            // Act
            boolean result = userService.checkEmailExists("");

            // Assert
            assertFalse(result);

            // Verify
            verify(userRepository).existsByEmail("");
        }
    }

    @Nested
    @DisplayName("deleteUser Tests")
    class DeleteUserTests {

        @Test
        @DisplayName("TC35: Xóa người dùng tồn tại")
        void deleteExistingUser() {
            // Arrange
            doNothing().when(userRepository).deleteById(anyLong());

            // Act
            userService.deleteUser(1L);

            // Verify
            verify(userRepository).deleteById(1L);
        }

        @Test
        @DisplayName("TC36: Xóa người dùng không tồn tại")
        void deleteNonExistentUser() {
            // Arrange
            doNothing().when(userRepository).deleteById(anyLong());

            // Act
            userService.deleteUser(999L);

            // Verify - Vẫn gọi deleteById mà không báo lỗi
            verify(userRepository).deleteById(999L);
        }

        @Test
        @DisplayName("TC37: Xóa người dùng với ID là 0")
        void deleteUserWithZeroId() {
            // Arrange
            doNothing().when(userRepository).deleteById(0L);

            // Act
            userService.deleteUser(0L);


            // Verify
            verify(userRepository).deleteById(0L);
        }

        @Test
        @DisplayName("TC38: Xóa người dùng với ID âm")
        void deleteUserWithNegativeId() {
            // Arrange
            doNothing().when(userRepository).deleteById(-1L);

            // Act
            userService.deleteUser(-1L);

            // Verify
            verify(userRepository).deleteById(-1L);
        }
    }
}
