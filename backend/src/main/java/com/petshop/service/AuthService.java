package com.petshop.service;

import com.petshop.dto.request.ChangePasswordRequest;
import com.petshop.dto.request.LoginRequest;
import com.petshop.dto.request.RegisterRequest;
import com.petshop.dto.request.UpdateProfileRequest;
import com.petshop.dto.response.JwtResponse;
import com.petshop.dto.response.UserDTO;

public interface AuthService {
    
    JwtResponse login(LoginRequest request);
    
    JwtResponse register(RegisterRequest request);
    
    UserDTO getCurrentUser();
    
    UserDTO updateProfile(UpdateProfileRequest request);
    
    void changePassword(ChangePasswordRequest request);
    
    void logout();
}
