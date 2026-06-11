package com.bluemoon.service;

import com.bluemoon.dto.request.*;
import com.bluemoon.model.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(Long id);

    User getUserByUsername(String username);

    User createUser(CreateUserRequestDto requestDto);

    User updateMyProfile(String username, UpdateMyProfileRequestDto requestDto);

    void changeMyPassword(String username, ChangePasswordRequestDto requestDto);

    User updateUserRole(Long id, UpdateUserRoleRequestDto requestDto);

    User updateUserActive(Long id, UpdateUserActiveRequestDto requestDto);
}
