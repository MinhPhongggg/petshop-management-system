package com.petshop.service.impl;

import com.petshop.dto.request.ReviewRequest;
import com.petshop.dto.response.ReviewDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public ReviewDTO createReview(ReviewRequest request) {
        User user = getCurrentUser();
        
        Review review = Review.builder()
            .user(user)
            .rating(request.getRating())
            .content(request.getContent())
            .images(request.getImages())
            .visible(true)
            .build();
        
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
            
            // Check if user has purchased this product
            boolean hasPurchased = orderRepository.existsByUserIdAndProductId(
                user.getId(), product.getId());
            
            if (!hasPurchased) {
                throw new BadRequestException("Bạn chưa mua sản phẩm này");
            }
            
            // Check if already reviewed
            if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
                throw new BadRequestException("Bạn đã đánh giá sản phẩm này");
            }
            
            review.setProduct(product);
            review = reviewRepository.save(review);
            
            // Update product rating
            updateProductRating(product);
            
        } else if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));
            
            if (!booking.getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Không có quyền đánh giá lịch hẹn này");
            }
            
            if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
                throw new BadRequestException("Chỉ có thể đánh giá sau khi hoàn thành dịch vụ");
            }
            
            // Check if already reviewed
            if (reviewRepository.existsByUserIdAndBookingId(user.getId(), booking.getId())) {
                throw new BadRequestException("Bạn đã đánh giá lịch hẹn này");
            }
            
            review.setBooking(booking);
            review = reviewRepository.save(review);
        } else {
            throw new BadRequestException("Phải chỉ định sản phẩm hoặc lịch hẹn để đánh giá");
        }
        
        return mapToDTO(review);
    }
    
    @Override
    public Page<ReviewDTO> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndVisibleAndHiddenOrderByCreatedAtDesc(
                productId, true, false, pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public Page<ReviewDTO> getMyReviews(Pageable pageable) {
        User user = getCurrentUser();
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    public Page<ReviewDTO> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    @Transactional
    public ReviewDTO replyToReview(Long id, String reply) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        
        review.setShopReply(reply);
        review.setReplyAt(LocalDateTime.now());
        review = reviewRepository.save(review);
        
        return mapToDTO(review);
    }
    
    @Override
    @Transactional
    public ReviewDTO hideReview(Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        
        review.setHidden(true);
        review = reviewRepository.save(review);
        
        // Update product rating if applicable
        if (review.getProduct() != null) {
            updateProductRating(review.getProduct());
        }
        
        return mapToDTO(review);
    }
    
    @Override
    @Transactional
    public ReviewDTO showReview(Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        
        review.setHidden(false);
        review = reviewRepository.save(review);
        
        // Update product rating if applicable
        if (review.getProduct() != null) {
            updateProductRating(review.getProduct());
        }
        
        return mapToDTO(review);
    }
    
    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        
        Product product = review.getProduct();
        reviewRepository.delete(review);
        
        // Update product rating if applicable
        if (product != null) {
            updateProductRating(product);
        }
    }
    
    private void updateProductRating(Product product) {
        BigDecimal avgRating = reviewRepository.getAverageRatingByProduct(product.getId());
        Long count = reviewRepository.countByProduct(product.getId());
        
        product.setAverageRating(avgRating != null ? 
            avgRating.setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        product.setReviewCount(count != null ? count.intValue() : 0);
        
        productRepository.save(product);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Chưa đăng nhập");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
            .id(review.getId())
            .userName(review.getUser().getFullName())
            .userAvatar(review.getUser().getAvatar())
            .productId(review.getProduct() != null ? review.getProduct().getId() : null)
            .productName(review.getProduct() != null ? review.getProduct().getName() : null)
            .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
            .rating(review.getRating())
            .content(review.getContent())
            .images(review.getImages())
            .shopReply(review.getShopReply())
            .visible(review.getVisible())
            .createdAt(review.getCreatedAt())
            .build();
    }
}
