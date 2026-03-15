package com.petshop.service;

import com.petshop.dto.request.VoucherRequest;
import com.petshop.dto.response.VoucherDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


public interface VoucherService {
    
    // CRUD (admin)
    VoucherDTO createVoucher(VoucherRequest request);
    VoucherDTO updateVoucher(Long id, VoucherRequest request);
    void deleteVoucher(Long id);
    VoucherDTO getVoucherById(Long id);
    
    // Lấy voucher theo mã
    VoucherDTO getVoucherByCode(String code);
    
    // Áp dụng voucher
    BigDecimal applyVoucher(String code, BigDecimal orderAmount);
    
    // Danh sách voucher
    List<VoucherDTO> getActiveVouchers();
    Page<VoucherDTO> getAllVouchers(Pageable pageable);
    
    // Customer wallet
    void saveVoucherForUser(Long voucherId);
    void unsaveVoucherForUser(Long voucherId);
    List<VoucherDTO> getMySavedVouchers();
    
    // Admin: usage analytics
    Page<Map<String, Object>> getVoucherUsageHistory(Long voucherId, Pageable pageable);

    // === Voucher chiến lược ===
    
    // Tạo voucher chào mừng cho khách hàng mới đăng ký
    void generateWelcomeVoucher(Long userId);
    
    // Tạo voucher sinh nhật thú cưng (loyalty)
    void generateBirthdayVouchers();
    
    // Tạo voucher định kỳ nhắc mua lại (recurring) sau khi mua sản phẩm lớn
    void generateRecurringVoucher(Long userId, String productName);
}
