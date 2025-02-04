package vn.unistock.unistockmanagementsystem.features.au.AU_02;

import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.User;

import java.time.LocalDateTime;

@Service
public class AU_02_Service {
    private final AU_02_Repository au02Repository;

    public AU_02_Service(AU_02_Repository au02Repository) {
        this.au02Repository = au02Repository;
    }


    public boolean existsByEmail(String email) {
        return au02Repository.existsByEmail(email);
    }

    public User registerUser(AU_02_DTO au02Dto) {
        if (au02Repository.existsByEmail(au02Dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }

        User user = User.builder()
                .email(au02Dto.getEmail())
                .password(au02Dto.getPassword())
                .createdAt(LocalDateTime.now())
                .build();

        return au02Repository.save(user);
    }
}
