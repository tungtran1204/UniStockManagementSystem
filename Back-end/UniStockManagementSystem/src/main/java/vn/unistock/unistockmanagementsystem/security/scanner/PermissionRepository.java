package vn.unistock.unistockmanagementsystem.security.scanner;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.Permission;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
        Optional<Permission> findByHttpMethodAndUrlPattern(String httpMethod, String urlPattern);
    }
