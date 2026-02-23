package com.petshop.service;

import com.petshop.dto.response.ImportResultDTO;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service để import sản phẩm từ file Excel
 */
public interface ProductImportService {
    
    /**
     * Import sản phẩm từ file Excel (.xlsx, .xls)
     * @param file File Excel chứa dữ liệu sản phẩm
     * @return Kết quả import
     */
    ImportResultDTO importFromExcel(MultipartFile file);
    
    /**
     * Tạo file Excel mẫu để import sản phẩm
     * @return byte array của file Excel
     */
    byte[] generateExcelTemplate();
}
