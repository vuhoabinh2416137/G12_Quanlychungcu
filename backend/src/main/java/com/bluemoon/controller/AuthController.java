package com.bluemoon.controller;

import com.bluemoon.dto.LoginResponseDto;
import com.bluemoon.dto.request.LoginRequestDto;
import com.bluemoon.model.User;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final com.bluemoon.service.UserService userService;
    private final com.bluemoon.repository.ResidentRepository residentRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            com.bluemoon.service.UserService userService,
            com.bluemoon.repository.ResidentRepository residentRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.residentRepository = residentRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody com.bluemoon.dto.request.CreateUserRequestDto requestDto) {
        // Enforce RESIDENT role
        com.bluemoon.dto.request.CreateUserRequestDto residentRequest = new com.bluemoon.dto.request.CreateUserRequestDto(
            requestDto.username(),
            requestDto.password(),
            "RESIDENT",
            requestDto.fullName(),
            requestDto.email(),
            requestDto.phone()
        );
        User createdUser = userService.createUser(residentRequest);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto requestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDto.username(), requestDto.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(userDetails, user.getRole(), user.getFullName());
        return ResponseEntity.ok(new LoginResponseDto(
                token,
                user.getRole(),
                user.getUsername(),
                user.getFullName()
        ));
    }
    @GetMapping("/check-resident")
    public ResponseEntity<?> checkResident(@RequestParam String phone) {
        com.bluemoon.model.Resident resident = residentRepository.findByPhone(phone.trim()).orElse(null);
        if (resident == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Không tìm thấy cư dân nào có số điện thoại này."));
        }
        return ResponseEntity.ok(java.util.Map.of(
                "fullName", resident.getFullName(),
                "hasAccount", resident.getUser() != null
        ));
    }
}
