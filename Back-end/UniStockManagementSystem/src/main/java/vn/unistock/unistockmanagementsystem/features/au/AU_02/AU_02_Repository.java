package vn.unistock.unistockmanagementsystem.features.au.AU_02;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.User;

public interface AU_02_Repository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
}
