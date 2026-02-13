package com.petshop.service.impl;

import com.petshop.dto.request.LoginRequest;
import com.petshop.dto.request.RegisterRequest;
import com.petshop.dto.response.JwtResponse;
import com.petshop.dto.response.UserDTO;
import com.petshop.entity.User;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.UserRepository;
import com.petshop.security.JwtTokenProvider;
import com.petshop.security.UserPrincipal;
import com.petshop.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(authentication);
        
        User user = userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return JwtResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .user(mapToDTO(user))
            .build();
    }
    
    @Override
    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng");
        }
        
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
        }
        
        User user = User.builder()
            .fullName(request.getFullName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .role(User.Role.CUSTOMER)
            .active(true)
            .build();
        
        user = userRepository.save(user);
        
        // Auto login
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);
        
        return JwtResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .user(mapToDTO(user))
            .build();
    }
    
    @Override
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Chưa đăng nhập");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return mapToDTO(user);
    }
    
    @Override
    public void logout() {
        SecurityContextHolder.clearContext();
    }
    
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getEmail()) // use email as username
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .avatarUrl(user.getAvatar())
            .role(user.getRole())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
