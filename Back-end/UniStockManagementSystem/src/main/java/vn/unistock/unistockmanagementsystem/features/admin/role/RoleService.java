package vn.unistock.unistockmanagementsystem.features.admin.role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.Role;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleMapper roleMapper;

    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public RoleDTO createRole(RoleDTO dto) {
        if (roleRepository.existsByRoleName(dto.getName())) {
            throw new RuntimeException("Vai trò đã tồn tại");
        }
        Role entity = roleMapper.toEntity(dto);
        entity = roleRepository.save(entity);
        return roleMapper.toDTO(entity);
    }


    public RoleDTO updateRoleStatus(Long id, boolean isActive) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò"));

        existingRole.setIsActive(isActive);
        existingRole = roleRepository.save(existingRole);
        return roleMapper.toDTO(existingRole);
    }

    public RoleDTO updateRole(Long id, RoleDTO dto) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò"));

        existingRole.setRoleName(dto.getName());
        existingRole.setDescription(dto.getDescription());
        existingRole.setIsActive(dto.getActive());

        existingRole = roleRepository.save(existingRole);
        return roleMapper.toDTO(existingRole);
    }

    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại"));

        roleRepository.delete(role);
    }

}
