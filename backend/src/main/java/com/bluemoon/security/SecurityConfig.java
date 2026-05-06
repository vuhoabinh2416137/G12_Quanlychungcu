package com.bluemoon.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Cấu hình cơ bản, các API chi tiết sẽ bị chặn bởi @PreAuthorize ở Controller
                        .anyRequest().authenticated()
                )
                // Kích hoạt HTTP Basic Auth (để bạn dễ dàng test qua Postman bằng tab Authorization -> Basic Auth)
                .httpBasic(withDefaults());

        return http.build();
    }

    // --- ĐÂY LÀ PHẦN LƯU 3 USER TRONG HEAP ---
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {

        // 1. Tạo user ADMIN
        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .roles("ADMIN") // Spring sẽ tự thêm tiền tố thành "ROLE_ADMIN"
                .build();

        // 2. Tạo user MANAGER
        UserDetails manager = User.builder()
                .username("manager")
                .password(passwordEncoder.encode("manager123"))
                .roles("MANAGER") // Thành "ROLE_MANAGER"
                .build();

        // 3. Tạo user RESIDENT
        UserDetails resident = User.builder()
                .username("resident")
                .password(passwordEncoder.encode("resident123"))
                .roles("RESIDENT") // Thành "ROLE_RESIDENT"
                .build();

        // Nạp 3 user này vào bộ nhớ (Heap)
        return new InMemoryUserDetailsManager(admin, manager, resident);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}