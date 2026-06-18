package com.bluemoon.dto.mapper;

import com.bluemoon.dto.UserResponseDto;
import com.bluemoon.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper chuyển đổi giữa User entity và DTO.
 */
@Component
public class UserMapper {

    public UserResponseDto toDto(User user) {
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

    public List<UserResponseDto> toDtoList(List<User> users) {
        return users.stream().map(this::toDto).toList();
    }
}
