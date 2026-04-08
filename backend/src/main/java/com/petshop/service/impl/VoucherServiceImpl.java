package com.petshop.service.impl;

import com.petshop.dto.request.VoucherRequest;
import com.petshop.dto.response.VoucherDTO;
import com.petshop.entity.SavedVoucher;
import com.petshop.entity.Pet;
import com.petshop.entity.User;
import com.petshop.entity.Voucher;
import com.petshop.entity.VoucherUsageLog;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.PetRepository;
import com.petshop.repository.SavedVoucherRepository;
import com.petshop.repository.UserRepository;
import com.petshop.repository.VoucherRepository;
import com.petshop.repository.VoucherUsageLogRepository;
import com.petshop.security.UserPrincipal;
import com.petshop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    
    private final VoucherRepository voucherRepository;
    private final SavedVoucherRepository savedVoucherRepository;
    private final VoucherUsageLogRepository voucherUsageLogRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    
    @Override
    @Transactional
    public VoucherDTO createVoucher(VoucherRequest request) {
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã voucher đã tồn tại");
        }
        
        Voucher voucher = Voucher.builder()
            .code(request.getCode().toUpperCase())
            .description(request.getDescription())
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .maxDiscount(request.getMaxDiscount())
            .minOrderAmount(request.getMinOrderAmount() != null ? 
                request.getMinOrderAmount() : BigDecimal.ZERO)
            .usageLimit(request.getUsageLimit())
            .usageLimitPerUser(request.getUsageLimitPerUser())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .applyTo(request.getApplyTo())
            .active(request.getActive() != null ? request.getActive() : true)
            .voucherCategory(request.getVoucherCategory() != null ? 
                request.getVoucherCategory() : Voucher.VoucherCategory.GENERAL)
            .build();
        
        voucher = voucherRepository.save(voucher);
        return mapToDTO(voucher);
    }
    
    @Override
    @Transactional
    public VoucherDTO updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        
        if (!voucher.getCode().equals(request.getCode().toUpperCase()) && 
            voucherRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã voucher đã tồn tại");
        }
        
        voucher.setCode(request.getCode().toUpperCase());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMaxDiscount(request.getMaxDiscount());
        voucher.setMinOrderAmount(request.getMinOrderAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setUsageLimitPerUser(request.getUsageLimitPerUser());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setApplyTo(request.getApplyTo());
        if (request.getActive() != null) {
            voucher.setActive(request.getActive());
        }
        if (request.getVoucherCategory() != null) {
            voucher.setVoucherCategory(request.getVoucherCategory());
        }
        
        voucher = voucherRepository.save(voucher);
        return mapToDTO(voucher);
    }
    
    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        
        // Soft delete
        voucher.setActive(false);
        voucherRepository.save(voucher);
    }
    
    @Override
    public VoucherDTO getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        return mapToDTO(voucher);
    }
    
    @Override
    public VoucherDTO getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        return mapToDTO(voucher);
    }
    
    @Override
    public BigDecimal applyVoucher(String code, BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new BadRequestException("Voucher không tồn tại"));
        
        // Validate using helper method
        if (!voucher.isValid()) {
            throw new BadRequestException("Voucher không hợp lệ hoặc đã hết hạn");
        }

        // Kiểm tra voucher cá nhân - chỉ user được chỉ định mới dùng được
        if (voucher.getTargetUser() != null) {
            try {
                User currentUser = getCurrentUser();
                if (!voucher.getTargetUser().getId().equals(currentUser.getId())) {
                    throw new BadRequestException("Voucher này không dành cho bạn");
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (Exception e) {
                throw new BadRequestException("Cần đăng nhập để sử dụng voucher này");
            }
        }

        // Kiểm tra giới hạn sử dụng per user
        try {
            User currentUser = getCurrentUser();
            long userUsageCount = voucherUsageLogRepository.countByUserIdAndVoucherId(
                    currentUser.getId(), voucher.getId());
            if (voucher.getUsageLimitPerUser() != null && userUsageCount >= voucher.getUsageLimitPerUser()) {
                throw new BadRequestException("Bạn đã sử dụng hết lượt cho voucher này");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception ignored) {}
        
        // Calculate and return discount using helper method
        return voucher.calculateDiscount(orderAmount);
    }
    
    @Override
    public List<VoucherDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> vouchers;
        try {
            User currentUser = getCurrentUser();
            vouchers = voucherRepository.findActiveVouchersForUser(now, currentUser.getId());
        } catch (Exception e) {
            vouchers = voucherRepository.findActiveVouchers(now);
        }
        return vouchers.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public Page<VoucherDTO> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable).map(this::mapToDTO);
    }
    
    private VoucherDTO mapToDTO(Voucher voucher) {
        int usedCount = voucher.getUsedCount() != null ? voucher.getUsedCount() : 0;
        Integer remainingUsage = null;
        if (voucher.getUsageLimit() != null) {
            remainingUsage = voucher.getUsageLimit() - usedCount;
        }
        
        // Check if current user has saved this voucher
        Boolean saved = null;
        try {
            User currentUser = getCurrentUser();
            saved = savedVoucherRepository.existsByUserIdAndVoucherId(currentUser.getId(), voucher.getId());
        } catch (Exception ignored) {}
        
        return VoucherDTO.builder()
            .id(voucher.getId())
            .code(voucher.getCode())
            .description(voucher.getDescription())
            .discountType(voucher.getDiscountType())
            .discountValue(voucher.getDiscountValue())
            .maxDiscount(voucher.getMaxDiscount())
            .minOrderAmount(voucher.getMinOrderAmount())
            .usageLimit(voucher.getUsageLimit())
            .usedCount(usedCount)
            .usageLimitPerUser(voucher.getUsageLimitPerUser())
            .remainingUsage(remainingUsage)
            .startDate(voucher.getStartDate())
            .endDate(voucher.getEndDate())
            .applyTo(voucher.getApplyTo())
            .voucherCategory(voucher.getVoucherCategory())
            .active(voucher.getActive())
            .isValid(voucher.isValid())
            .saved(saved)
            .createdAt(voucher.getCreatedAt())
            .build();
    }
    
    // ===== Customer Wallet =====
    
    @Override
    @Transactional
    public void saveVoucherForUser(Long voucherId) {
        User user = getCurrentUser();
        Voucher voucher = voucherRepository.findById(voucherId)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        
        if (!voucher.isValid()) {
            throw new BadRequestException("Voucher không hợp lệ hoặc đã hết hạn");
        }
        
        if (savedVoucherRepository.existsByUserIdAndVoucherId(user.getId(), voucherId)) {
            throw new BadRequestException("Bạn đã lưu voucher này rồi");
        }
        
        SavedVoucher saved = SavedVoucher.builder()
            .user(user)
            .voucher(voucher)
            .build();
        savedVoucherRepository.save(saved);
    }
    
    @Override
    @Transactional
    public void unsaveVoucherForUser(Long voucherId) {
        User user = getCurrentUser();
        if (!savedVoucherRepository.existsByUserIdAndVoucherId(user.getId(), voucherId)) {
            throw new BadRequestException("Voucher chưa được lưu");
        }
        savedVoucherRepository.deleteByUserIdAndVoucherId(user.getId(), voucherId);
    }
    
    @Override
    public List<VoucherDTO> getMySavedVouchers() {
        User user = getCurrentUser();
        return savedVoucherRepository.findByUserIdOrderBySavedAtDesc(user.getId()).stream()
            .map(sv -> mapToDTO(sv.getVoucher()))
            .collect(Collectors.toList());
    }
    
    // ===== Admin: Usage analytics =====
    
    @Override
    public Page<Map<String, Object>> getVoucherUsageHistory(Long voucherId, Pageable pageable) {
        Page<VoucherUsageLog> logs = voucherUsageLogRepository.findByVoucherIdOrderByUsedAtDesc(voucherId, pageable);
        
        List<Map<String, Object>> result = logs.getContent().stream().map(log -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", log.getId());
            map.put("userName", log.getUser().getFullName());
            map.put("userEmail", log.getUser().getEmail());
            map.put("orderAmount", log.getOrderAmount());
            map.put("discountAmount", log.getDiscountAmount());
            map.put("usedAt", log.getUsedAt());
            if (log.getOrder() != null) {
                map.put("orderCode", log.getOrder().getOrderCode());
            }
            return map;
        }).collect(Collectors.toList());
        
        return new PageImpl<>(result, pageable, logs.getTotalElements());
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

    // ===== Voucher chiến lược =====

    @Override
    @Transactional
    public void generateWelcomeVoucher(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Kiểm tra đã có welcome voucher chưa
        List<Voucher> existing = voucherRepository.findByCategoryAndTargetUser(
                Voucher.VoucherCategory.WELCOME, userId);
        if (!existing.isEmpty()) {
            log.info("User {} already has a welcome voucher", user.getEmail());
            return;
        }

        String code = "WELCOME-" + user.getId() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        Voucher voucher = Voucher.builder()
            .code(code)
            .description("Chào mừng " + user.getFullName() + "! Giảm 10% cho đơn hàng đầu tiên")
            .discountType(Voucher.DiscountType.PERCENTAGE)
            .discountValue(BigDecimal.TEN)
            .maxDiscount(BigDecimal.valueOf(100000))
            .minOrderAmount(BigDecimal.valueOf(200000))
            .usageLimit(1)
            .usageLimitPerUser(1)
            .startDate(LocalDateTime.now())
            .endDate(LocalDateTime.now().plusMonths(1))
            .applyTo(Voucher.ApplyTo.ALL)
            .active(true)
            .voucherCategory(Voucher.VoucherCategory.WELCOME)
            .targetUser(user)
            .build();
        
        voucherRepository.save(voucher);

        // Tự động lưu vào ví khách hàng
        SavedVoucher saved = SavedVoucher.builder()
            .user(user)
            .voucher(voucher)
            .build();
        savedVoucherRepository.save(saved);

        log.info("Generated welcome voucher {} for user {}", code, user.getEmail());
    }

    @Override
    @Transactional
    public void generateBirthdayVouchers() {
        LocalDate today = LocalDate.now();
        List<Pet> birthdayPets = petRepository.findPetsWithBirthdayOn(
                today.getMonthValue(), today.getDayOfMonth());

        for (Pet pet : birthdayPets) {
            User owner = pet.getOwner();
            
            // Kiểm tra đã tặng voucher sinh nhật năm nay chưa
            String yearPrefix = "HPBD-" + pet.getId() + "-" + today.getYear();
            if (voucherRepository.existsByCode(yearPrefix)) {
                continue;
            }

            Voucher voucher = Voucher.builder()
                .code(yearPrefix)
                .description("Chúc mừng sinh nhật " + pet.getName() + "! 🎂 Giảm 15% cho đơn hàng tiếp theo")
                .discountType(Voucher.DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(15))
                .maxDiscount(BigDecimal.valueOf(150000))
                .minOrderAmount(BigDecimal.valueOf(300000))
                .usageLimit(1)
                .usageLimitPerUser(1)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(30))
                .applyTo(Voucher.ApplyTo.ALL)
                .active(true)
                .voucherCategory(Voucher.VoucherCategory.LOYALTY)
                .targetUser(owner)
                .build();

            voucherRepository.save(voucher);

            // Tự động lưu vào ví
            SavedVoucher saved = SavedVoucher.builder()
                .user(owner)
                .voucher(voucher)
                .build();
            savedVoucherRepository.save(saved);

            log.info("Generated birthday voucher {} for pet {} (owner: {})", 
                    yearPrefix, pet.getName(), owner.getEmail());
        }
    }

    @Override
    @Transactional
    public void generateRecurringVoucher(Long userId, String productName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String code = "REBUY-" + user.getId() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Voucher voucher = Voucher.builder()
            .code(code)
            .description("Sắp hết " + productName + " rồi? Giảm 5% cho đơn mua lại!")
            .discountType(Voucher.DiscountType.PERCENTAGE)
            .discountValue(BigDecimal.valueOf(5))
            .maxDiscount(BigDecimal.valueOf(50000))
            .minOrderAmount(BigDecimal.valueOf(200000))
            .usageLimit(1)
            .usageLimitPerUser(1)
            // Voucher bắt đầu hiệu lực sau 25 ngày
            .startDate(LocalDateTime.now().plusDays(25))
            .endDate(LocalDateTime.now().plusDays(40))
            .applyTo(Voucher.ApplyTo.PRODUCTS)
            .active(true)
            .voucherCategory(Voucher.VoucherCategory.RECURRING)
            .targetUser(user)
            .build();

        voucherRepository.save(voucher);

        // Tự động lưu vào ví
        SavedVoucher saved = SavedVoucher.builder()
            .user(user)
            .voucher(voucher)
            .build();
        savedVoucherRepository.save(saved);

        log.info("Generated recurring voucher {} for user {} (product: {})", 
                code, user.getEmail(), productName);
    }
}
