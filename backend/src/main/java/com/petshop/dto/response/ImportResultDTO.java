package com.petshop.dto.response;

import com.petshop.dto.request.ProductImportDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Kết quả import sản phẩm từ file Excel
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDTO {
    
    @Builder.Default
    private int totalRows = 0;
    
    @Builder.Default
    private int successCount = 0;
    
    @Builder.Default
    private int errorCount = 0;
    
    @Builder.Default
    private int skippedCount = 0;
    
    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();
    
    @Builder.Default
    private List<String> createdProducts = new ArrayList<>();
    
    private String message;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private int rowNumber;
        private String productName;
        private String errorMessage;
    }
    
    public void addError(int row, String productName, String error) {
        this.errorCount++;
        this.errors.add(ImportError.builder()
                .rowNumber(row)
                .productName(productName)
                .errorMessage(error)
                .build());
    }
    
    public void addSuccess(String productName) {
        this.successCount++;
        this.createdProducts.add(productName);
    }
    
    public void generateMessage() {
        this.message = String.format(
            "Đã xử lý %d dòng: %d thành công, %d lỗi, %d bỏ qua",
            totalRows, successCount, errorCount, skippedCount
        );
    }
}
