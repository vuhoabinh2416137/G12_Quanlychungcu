package com.bluemoon.controller;

import com.bluemoon.dto.LoginResponseDto;
import com.bluemoon.dto.request.CreateUserRequestDto;
import com.bluemoon.dto.request.LoginRequestDto;
import com.bluemoon.model.Resident;
import com.bluemoon.model.User;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.service.UserService;
import com.bluemoon.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final ResidentRepository residentRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            UserService userService,
            ResidentRepository residentRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.residentRepository = residentRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateUserRequestDto requestDto) {
        // Enforce RESIDENT role
        CreateUserRequestDto residentRequest = new CreateUserRequestDto(
            requestDto.username(),
            requestDto.password(),
            "RESIDENT",
            requestDto.fullName(),
            requestDto.email(),
            requestDto.phone()
        );
        User createdUser = userService.createUser(residentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
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
        Resident resident = residentRepository.findByPhone(phone.trim()).orElse(null);
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy cư dân nào có số điện thoại này."));
        }
        return ResponseEntity.ok(Map.of(
                "fullName", resident.getFullName(),
                "hasAccount", resident.getUser() != null
        ));
    }
}
