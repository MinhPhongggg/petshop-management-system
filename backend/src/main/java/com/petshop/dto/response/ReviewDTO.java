package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    
    private Long id;
    
    // Người đánh giá
    private Long userId;
    private String userName;
    private String userAvatar;
    
    // Đối tượng đánh giá
    private Long productId;
    private String productName;
    private Long bookingId;
    private String serviceName;
    
    // Nội dung
    private Integer rating;
    private String content;
    private List<String> images;
    
    // Phản hồi shop
    private String shopReply;
    private LocalDateTime replyAt;
    
    private Boolean visible;
    private Boolean hidden;
    private LocalDateTime createdAt;
}
