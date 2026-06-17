package com.bluemoon.service.impl;

import com.bluemoon.dto.request.*;
import com.bluemoon.model.User;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.exception.DuplicateResourceException;
import com.bluemoon.exception.ResourceNotFoundException;
import com.bluemoon.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.bluemoon.repository.ResidentRepository residentRepository;
    private final com.bluemoon.repository.PaymentRepository paymentRepository;
    private final com.bluemoon.repository.NotificationRepository notificationRepository;
    private final com.bluemoon.repository.FeedbackRepository feedbackRepository;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, com.bluemoon.repository.ResidentRepository residentRepository,
                           com.bluemoon.repository.PaymentRepository paymentRepository,
                           com.bluemoon.repository.NotificationRepository notificationRepository,
                           com.bluemoon.repository.FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.residentRepository = residentRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.feedbackRepository = feedbackRepository;
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

        com.bluemoon.model.Resident residentToLink = null;

        if ("RESIDENT".equals(requestDto.role())) {
            if (requestDto.phone() == null || requestDto.phone().isBlank()) {
                throw new IllegalArgumentException("Vui lòng nhập số điện thoại để tạo tài khoản cư dân.");
            }
            residentToLink = residentRepository.findByPhone(requestDto.phone().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin cư dân nào có số điện thoại này."));

            if (requestDto.fullName() == null || !requestDto.fullName().trim().equalsIgnoreCase(residentToLink.getFullName().trim())) {
                throw new IllegalArgumentException("Có phải tên của bạn là " + residentToLink.getFullName() + "?");
            }

            if (residentToLink.getUser() != null) {
                throw new IllegalArgumentException("Cư dân này đã có tài khoản!");
            }
        }

        User user = new User();
        user.setUsername(requestDto.username().trim());
        user.setPassword(passwordEncoder.encode(requestDto.password()));
        user.setRole(requestDto.role());
        user.setFullName(requestDto.fullName().trim());
        user.setEmail(normalizeBlank(requestDto.email()));
        user.setPhone(normalizeBlank(requestDto.phone()));
        user.setActive(true);
        User savedUser = userRepository.save(user);

        if (residentToLink != null) {
            residentToLink.setUser(savedUser);
            residentRepository.save(residentToLink);
        }

        return savedUser;
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

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        // Unlink resident if exists
        com.bluemoon.model.Resident resident = residentRepository.findByUser_Username(user.getUsername()).orElse(null);
        if (resident != null) {
            resident.setUser(null);
            residentRepository.save(resident);
        }

        paymentRepository.unlinkPayer(user);
        notificationRepository.unlinkSender(user);
        feedbackRepository.unlinkAuthor(user);
        
        userRepository.delete(user);
    }

    private String normalizeBlank(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
