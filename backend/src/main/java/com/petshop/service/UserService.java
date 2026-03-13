package com.petshop.service;

import com.petshop.dto.response.UserDTO;
import com.petshop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserDTO> getAllUsers(String role, Pageable pageable);
    UserDTO getUserById(Long id);
    UserDTO updateRole(Long id, User.Role role);
    UserDTO updateStatus(Long id, boolean active);
    void deleteUser(Long id);
}
