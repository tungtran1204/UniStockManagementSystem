package vn.unistock.unistockmanagementsystem.features.au.AU_01;

import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.User;

@Service
public class AU_01_Service {
    private final AU_01_Repository au01Repository;

    public AU_01_Service(AU_01_Repository au01Repository) {
        this.au01Repository = au01Repository;
    }


    public User loadUserByEmail(String email) {
        return au01Repository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
