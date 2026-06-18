package com.bluemoon.controller;

import com.bluemoon.dto.UserResponseDto;
import com.bluemoon.dto.mapper.UserMapper;
import com.bluemoon.dto.request.*;
import com.bluemoon.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userMapper.toDtoList(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userMapper.toDto(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(userService.createUser(requestDto)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequestDto requestDto
    ) {
        return ResponseEntity.ok(userMapper.toDto(userService.updateUserRole(id, requestDto)));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUserActive(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserActiveRequestDto requestDto
    ) {
        return ResponseEntity.ok(userMapper.toDto(userService.updateUserActive(id, requestDto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<UserResponseDto> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(userMapper.toDto(userService.getUserByUsername(auth.getName())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<UserResponseDto> updateMyProfile(
            Authentication auth,
            @Valid @RequestBody UpdateMyProfileRequestDto requestDto
    ) {
        return ResponseEntity.ok(userMapper.toDto(userService.updateMyProfile(auth.getName(), requestDto)));
    }

    @PatchMapping("/me/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<Void> changeMyPassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequestDto requestDto
    ) {
        userService.changeMyPassword(auth.getName(), requestDto);
        return ResponseEntity.noContent().build();
    }
}
