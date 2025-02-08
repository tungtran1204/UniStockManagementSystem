package vn.unistock.unistockmanagementsystem.features.admin.roles;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.Role;

import java.util.Optional;
@Repository
public interface RolesRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String name);
    Optional<Role> findByRoleId(Long id);
}
