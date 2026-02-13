package com.petshop.service;

import com.petshop.dto.request.VoucherRequest;
import com.petshop.dto.response.VoucherDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

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
}
