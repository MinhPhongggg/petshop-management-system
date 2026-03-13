package com.petshop.service.impl;

import com.petshop.dto.response.UserDTO;
import com.petshop.entity.User;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.UserRepository;
import com.petshop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public Page<UserDTO> getAllUsers(String role, Pageable pageable) {
        Page<User> users;
        if (role != null && !role.isEmpty()) {
            try {
                User.Role userRole = User.Role.valueOf(role.toUpperCase());
                users = userRepository.findByRole(userRole, pageable);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll(pageable);
            }
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::mapToDTO);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return mapToDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateRole(Long id, User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        user.setRole(role);
        return mapToDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDTO updateStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        user.setActive(active);
        return mapToDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        userRepository.delete(user);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatar())
                .role(user.getRole())
                .active(user.isActive())
                .petCount(user.getPets() != null ? user.getPets().size() : 0)
                .orderCount(user.getOrders() != null ? user.getOrders().size() : 0)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
