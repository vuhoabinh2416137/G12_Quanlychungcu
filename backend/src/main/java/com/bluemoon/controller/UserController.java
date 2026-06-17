package com.bluemoon.controller;

import com.bluemoon.dto.UserResponseDto;
import com.bluemoon.dto.request.*;
import com.bluemoon.model.User;
import com.bluemoon.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers().stream().map(this::toDto).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(userService.createUser(requestDto)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequestDto requestDto
    ) {
        return ResponseEntity.ok(toDto(userService.updateUserRole(id, requestDto)));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUserActive(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserActiveRequestDto requestDto
    ) {
        return ResponseEntity.ok(toDto(userService.updateUserActive(id, requestDto)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<UserResponseDto> getMyProfile(org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(toDto(userService.getUserByUsername(auth.getName())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<UserResponseDto> updateMyProfile(
            org.springframework.security.core.Authentication auth,
            @Valid @RequestBody UpdateMyProfileRequestDto requestDto
    ) {
        return ResponseEntity.ok(toDto(userService.updateMyProfile(auth.getName(), requestDto)));
    }

    @PatchMapping("/me/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<Void> changeMyPassword(
            org.springframework.security.core.Authentication auth,
            @Valid @RequestBody ChangePasswordRequestDto requestDto
    ) {
        userService.changeMyPassword(auth.getName(), requestDto);
        return ResponseEntity.noContent().build();
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getActive(),
                user.getCreatedAt()
        );
    }
}
