package vn.unistock.unistockmanagementsystem.features.au.AU_01;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.User;

import java.util.Optional;

public interface AU_01_Repository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
