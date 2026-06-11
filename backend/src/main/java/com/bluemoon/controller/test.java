package com.bluemoon.controller;

import com.bluemoon.model.User;
import com.bluemoon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class test {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAPI(Authentication authentication){
        Map<String, Object> response = new HashMap<>();
        response.put("message", "thanh cong roi");
        
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user != null) {
                response.put("username", user.getUsername());
                response.put("role", user.getRole());
            }
        }
        
        return ResponseEntity.ok(response);
    }
}
