package com.bluemoon.repository;

import com.bluemoon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm user theo username để làm chức năng Đăng nhập
    Optional<User> findByUsername(String username);

    // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}