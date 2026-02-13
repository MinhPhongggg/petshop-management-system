package com.petshop.dto.response;

import com.petshop.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String avatarUrl;
    private User.Role role;
    private Boolean active;
    private Integer petCount;
    private Integer orderCount;
    private LocalDateTime createdAt;
}
