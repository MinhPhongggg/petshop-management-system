package com.petshop.controller;

import com.petshop.dto.response.ImportResultDTO;
import com.petshop.service.ProductImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ImportController {
    
    private final ProductImportService productImportService;
    
    /**
     * Import sản phẩm từ file Excel
     */
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResultDTO> importProducts(@RequestParam("file") MultipartFile file) {
        ImportResultDTO result = productImportService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Tải file Excel mẫu để import sản phẩm
     */
    @GetMapping("/products/template")
    public ResponseEntity<byte[]> downloadProductTemplate() {
        byte[] template = productImportService.generateExcelTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "product_import_template.xlsx");
        headers.setContentLength(template.length);
        
        return new ResponseEntity<>(template, headers, HttpStatus.OK);
    }
}
