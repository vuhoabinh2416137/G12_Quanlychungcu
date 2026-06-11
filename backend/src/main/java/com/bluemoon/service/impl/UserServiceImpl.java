package com.bluemoon.service.impl;

import com.bluemoon.dto.request.*;
import com.bluemoon.model.User;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Override
    @Transactional
    public User createUser(CreateUserRequestDto requestDto) {
        if (userRepository.existsByUsername(requestDto.username())) {
            throw new DuplicateResourceException("Username already exists: " + requestDto.username());
        }
        if (requestDto.email() != null && !requestDto.email().isBlank() && userRepository.existsByEmail(requestDto.email())) {
            throw new DuplicateResourceException("Email already exists: " + requestDto.email());
        }

        User user = new User();
        user.setUsername(requestDto.username().trim());
        user.setPassword(passwordEncoder.encode(requestDto.password()));
        user.setRole(requestDto.role());
        user.setFullName(requestDto.fullName().trim());
        user.setEmail(normalizeBlank(requestDto.email()));
        user.setPhone(normalizeBlank(requestDto.phone()));
        user.setActive(true);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateMyProfile(String username, UpdateMyProfileRequestDto requestDto) {
        User user = getUserByUsername(username);
        user.setFullName(requestDto.fullName().trim());
        user.setEmail(normalizeBlank(requestDto.email()));
        user.setPhone(normalizeBlank(requestDto.phone()));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeMyPassword(String username, ChangePasswordRequestDto requestDto) {
        User user = getUserByUsername(username);
        if (!passwordEncoder.matches(requestDto.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(requestDto.newPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserRole(Long id, UpdateUserRoleRequestDto requestDto) {
        User user = getUserById(id);
        user.setRole(requestDto.role());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserActive(Long id, UpdateUserActiveRequestDto requestDto) {
        User user = getUserById(id);
        user.setActive(requestDto.active());
        return userRepository.save(user);
    }

    private String normalizeBlank(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
