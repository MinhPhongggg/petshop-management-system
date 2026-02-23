package com.petshop.service.impl;

import com.petshop.dto.request.ProductImportDTO;
import com.petshop.dto.response.ImportResultDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.repository.*;
import com.petshop.service.ProductImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImportServiceImpl implements ProductImportService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    
    // Column indexes trong file Excel
    private static final int COL_NAME = 0;
    private static final int COL_SHORT_DESC = 1;
    private static final int COL_DESCRIPTION = 2;
    private static final int COL_CATEGORY = 3;
    private static final int COL_BRAND = 4;
    private static final int COL_BASE_PRICE = 5;
    private static final int COL_SALE_PRICE = 6;
    private static final int COL_VARIANT_NAME = 7;
    private static final int COL_VARIANT_SKU = 8;
    private static final int COL_VARIANT_PRICE = 9;
    private static final int COL_VARIANT_STOCK = 10;
    private static final int COL_IMAGE_URL = 11;
    private static final int COL_FEATURED = 12;
    
    @Override
    @Transactional
    public ImportResultDTO importFromExcel(MultipartFile file) {
        validateFile(file);
        
        ImportResultDTO result = ImportResultDTO.builder().build();
        List<ProductImportDTO> importRecords = new ArrayList<>();
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            int totalRows = sheet.getLastRowNum();
            result.setTotalRows(totalRows);
            
            // Bắt đầu từ dòng 1 (bỏ qua header)
            for (int rowNum = 1; rowNum <= totalRows; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null || isEmptyRow(row)) {
                    result.setSkippedCount(result.getSkippedCount() + 1);
                    continue;
                }
                
                ProductImportDTO dto = parseRow(row, rowNum);
                importRecords.add(dto);
            }
            
            // Xử lý và import các sản phẩm
            processImportRecords(importRecords, result);
            
        } catch (IOException e) {
            log.error("Error reading Excel file", e);
            throw new BadRequestException("Không thể đọc file Excel: " + e.getMessage());
        }
        
        result.generateMessage();
        return result;
    }
    
    @Override
    public byte[] generateExcelTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Products");
            
            // Tạo header style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Tên sản phẩm (*)",
                "Mô tả ngắn",
                "Mô tả chi tiết",
                "Danh mục (*)",
                "Thương hiệu",
                "Giá gốc (*)",
                "Giá khuyến mãi",
                "Tên biến thể",
                "SKU biến thể",
                "Giá biến thể",
                "Tồn kho biến thể",
                "URL ảnh",
                "Nổi bật (true/false)"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 20 * 256);
            }
            
            // Tạo example row
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(COL_NAME).setCellValue("Thức ăn cho chó Royal Canin");
            exampleRow.createCell(COL_SHORT_DESC).setCellValue("Thức ăn hạt cao cấp cho chó");
            exampleRow.createCell(COL_DESCRIPTION).setCellValue("Mô tả chi tiết sản phẩm...");
            exampleRow.createCell(COL_CATEGORY).setCellValue("Chó > Thức ăn (Hạt, Pate, Sữa)");
            exampleRow.createCell(COL_BRAND).setCellValue("Royal Canin");
            exampleRow.createCell(COL_BASE_PRICE).setCellValue(450000);
            exampleRow.createCell(COL_SALE_PRICE).setCellValue(380000);
            exampleRow.createCell(COL_VARIANT_NAME).setCellValue("2kg");
            exampleRow.createCell(COL_VARIANT_SKU).setCellValue("RC-DOG-2KG");
            exampleRow.createCell(COL_VARIANT_PRICE).setCellValue(380000);
            exampleRow.createCell(COL_VARIANT_STOCK).setCellValue(50);
            exampleRow.createCell(COL_IMAGE_URL).setCellValue("https://example.com/image.jpg");
            exampleRow.createCell(COL_FEATURED).setCellValue("true");
            
            // Second variant example
            Row exampleRow2 = sheet.createRow(2);
            exampleRow2.createCell(COL_NAME).setCellValue("Thức ăn cho chó Royal Canin");
            exampleRow2.createCell(COL_VARIANT_NAME).setCellValue("5kg");
            exampleRow2.createCell(COL_VARIANT_SKU).setCellValue("RC-DOG-5KG");
            exampleRow2.createCell(COL_VARIANT_PRICE).setCellValue(850000);
            exampleRow2.createCell(COL_VARIANT_STOCK).setCellValue(30);
            
            // Tạo sheet hướng dẫn
            Sheet guideSheet = workbook.createSheet("Hướng dẫn");
            int guideRow = 0;
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("HƯỚNG DẪN IMPORT SẢN PHẨM");
            guideSheet.createRow(guideRow++);
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("1. Các cột có dấu (*) là bắt buộc");
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("2. Tên danh mục phải khớp với danh mục đã có trong hệ thống (xem sheet 'Danh mục')");
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("3. Nếu có nhiều danh mục cùng tên, sử dụng đường dẫn đầy đủ (VD: 'Chó > Thức ăn')");
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("4. Tên thương hiệu nếu không tồn tại sẽ được tạo mới");
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("5. Để thêm nhiều biến thể cho cùng 1 sản phẩm, nhập cùng tên sản phẩm ở nhiều dòng");
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("6. Giá sử dụng số nguyên, không dùng dấu phẩy (VD: 450000)");
            guideSheet.createRow(guideRow++).createCell(0).setCellValue("7. Cột 'Nổi bật' nhập 'true' hoặc 'false'");
            guideSheet.setColumnWidth(0, 80 * 256);
            
            // Tạo sheet danh mục
            Sheet categorySheet = workbook.createSheet("Danh mục");
            Row catHeaderRow = categorySheet.createRow(0);
            catHeaderRow.createCell(0).setCellValue("Tên danh mục");
            catHeaderRow.createCell(0).setCellStyle(headerStyle);
            catHeaderRow.createCell(1).setCellValue("Đường dẫn đầy đủ");
            catHeaderRow.createCell(1).setCellStyle(headerStyle);
            categorySheet.setColumnWidth(0, 30 * 256);
            categorySheet.setColumnWidth(1, 50 * 256);
            
            // Thêm danh sách danh mục
            List<Category> allCategories = categoryRepository.findAllActiveOrdered();
            int catRow = 1;
            for (Category cat : allCategories) {
                Row row = categorySheet.createRow(catRow++);
                row.createCell(0).setCellValue(cat.getName());
                row.createCell(1).setCellValue(cat.getFullPath());
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("Error generating Excel template", e);
            throw new BadRequestException("Không thể tạo file mẫu: " + e.getMessage());
        }
    }
    
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            throw new BadRequestException("Chỉ hỗ trợ file Excel (.xlsx, .xls)");
        }
        
        // Max 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File không được vượt quá 10MB");
        }
    }
    
    private boolean isEmptyRow(Row row) {
        Cell firstCell = row.getCell(COL_NAME);
        return firstCell == null || getCellStringValue(firstCell).trim().isEmpty();
    }
    
    private ProductImportDTO parseRow(Row row, int rowNum) {
        ProductImportDTO dto = new ProductImportDTO();
        dto.setRowNumber(rowNum + 1); // Excel rows are 1-indexed for users
        
        try {
            dto.setName(getCellStringValue(row.getCell(COL_NAME)));
            dto.setShortDescription(getCellStringValue(row.getCell(COL_SHORT_DESC)));
            dto.setDescription(getCellStringValue(row.getCell(COL_DESCRIPTION)));
            dto.setCategoryName(getCellStringValue(row.getCell(COL_CATEGORY)));
            dto.setBrandName(getCellStringValue(row.getCell(COL_BRAND)));
            dto.setBasePrice(getCellBigDecimalValue(row.getCell(COL_BASE_PRICE)));
            dto.setSalePrice(getCellBigDecimalValue(row.getCell(COL_SALE_PRICE)));
            dto.setVariantName(getCellStringValue(row.getCell(COL_VARIANT_NAME)));
            dto.setVariantSku(getCellStringValue(row.getCell(COL_VARIANT_SKU)));
            dto.setVariantPrice(getCellBigDecimalValue(row.getCell(COL_VARIANT_PRICE)));
            dto.setVariantStock(getCellIntegerValue(row.getCell(COL_VARIANT_STOCK)));
            dto.setImageUrl(getCellStringValue(row.getCell(COL_IMAGE_URL)));
            dto.setFeatured(getCellBooleanValue(row.getCell(COL_FEATURED)));
            
            // Validate required fields
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                dto.addError("Tên sản phẩm là bắt buộc");
            }
            if (dto.getCategoryName() == null || dto.getCategoryName().trim().isEmpty()) {
                dto.addError("Danh mục là bắt buộc");
            }
            if (dto.getBasePrice() == null || dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
                // Có thể bỏ qua nếu đây là dòng biến thể bổ sung
                if (dto.getVariantName() == null || dto.getVariantName().trim().isEmpty()) {
                    dto.addError("Giá gốc là bắt buộc");
                }
            }
            
        } catch (Exception e) {
            dto.addError("Lỗi đọc dữ liệu: " + e.getMessage());
        }
        
        return dto;
    }
    
    private void processImportRecords(List<ProductImportDTO> records, ImportResultDTO result) {
        // Group records by product name
        Map<String, List<ProductImportDTO>> productGroups = new LinkedHashMap<>();
        for (ProductImportDTO record : records) {
            if (record.getName() != null && !record.getName().trim().isEmpty()) {
                productGroups.computeIfAbsent(record.getName().trim(), k -> new ArrayList<>()).add(record);
            }
        }
        
        // Process each product group
        for (Map.Entry<String, List<ProductImportDTO>> entry : productGroups.entrySet()) {
            String productName = entry.getKey();
            List<ProductImportDTO> rows = entry.getValue();
            ProductImportDTO mainRow = rows.get(0);
            
            // Check for validation errors in main row
            if (!mainRow.isValid()) {
                result.addError(mainRow.getRowNumber(), productName, mainRow.getErrorMessage());
                continue;
            }
            
            try {
                // Check if product already exists
                String slug = generateSlug(productName);
                if (productRepository.existsBySlug(slug)) {
                    result.addError(mainRow.getRowNumber(), productName, "Sản phẩm đã tồn tại");
                    continue;
                }
                
                // Find or create category - hỗ trợ tìm theo tên hoặc đường dẫn đầy đủ
                Category category = findCategoryByNameOrPath(mainRow.getCategoryName().trim());
                if (category == null) {
                    result.addError(mainRow.getRowNumber(), productName, 
                        "Danh mục không tồn tại: " + mainRow.getCategoryName() + 
                        ". Nếu có nhiều danh mục cùng tên, sử dụng đường dẫn đầy đủ (VD: 'Chó > Thức ăn')");
                    continue;
                }
                
                // Find or create brand
                Brand brand = null;
                if (mainRow.getBrandName() != null && !mainRow.getBrandName().trim().isEmpty()) {
                    brand = brandRepository.findByNameIgnoreCase(mainRow.getBrandName().trim())
                        .orElseGet(() -> createNewBrand(mainRow.getBrandName().trim()));
                }
                
                // Create product
                Product product = Product.builder()
                    .name(productName)
                    .slug(slug)
                    .shortDescription(mainRow.getShortDescription())
                    .description(mainRow.getDescription())
                    .category(category)
                    .brand(brand)
                    .basePrice(mainRow.getBasePrice())
                    .salePrice(mainRow.getSalePrice())
                    .featured(mainRow.getFeatured() != null && mainRow.getFeatured())
                    .active(true)
                    .build();
                
                product = productRepository.save(product);
                
                // Add variants
                for (ProductImportDTO row : rows) {
                    if (row.getVariantName() != null && !row.getVariantName().trim().isEmpty()) {
                        ProductVariant variant = ProductVariant.builder()
                            .product(product)
                            .name(row.getVariantName().trim())
                            .sku(row.getVariantSku())
                            .price(row.getVariantPrice() != null ? row.getVariantPrice() : mainRow.getBasePrice())
                            .stock(row.getVariantStock() != null ? row.getVariantStock() : 0)
                            .build();
                        productVariantRepository.save(variant);
                    }
                }
                
                // Add image
                if (mainRow.getImageUrl() != null && !mainRow.getImageUrl().trim().isEmpty()) {
                    ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(mainRow.getImageUrl().trim())
                        .isPrimary(true)
                        .sortOrder(0)
                        .build();
                    productImageRepository.save(image);
                }
                
                result.addSuccess(productName);
                
            } catch (Exception e) {
                log.error("Error importing product: " + productName, e);
                result.addError(mainRow.getRowNumber(), productName, "Lỗi: " + e.getMessage());
            }
        }
    }
    
    private Brand createNewBrand(String name) {
        Brand brand = Brand.builder()
            .name(name)
            .slug(generateSlug(name))
            .active(true)
            .build();
        return brandRepository.save(brand);
    }
    
    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("đ", "d")
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
    
    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return null;
        }
    }
    
    private BigDecimal getCellBigDecimalValue(Cell cell) {
        if (cell == null) return null;
        
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return BigDecimal.valueOf(cell.getNumericCellValue());
                case STRING:
                    String value = cell.getStringCellValue().trim()
                        .replaceAll("[,.](?=\\d{3})", "") // Remove thousand separators
                        .replace(",", ".");
                    if (value.isEmpty()) return null;
                    return new BigDecimal(value);
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }
    
    private Integer getCellIntegerValue(Cell cell) {
        if (cell == null) return null;
        
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return (int) cell.getNumericCellValue();
                case STRING:
                    String value = cell.getStringCellValue().trim();
                    if (value.isEmpty()) return null;
                    return Integer.parseInt(value);
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }
    
    private Boolean getCellBooleanValue(Cell cell) {
        if (cell == null) return false;
        
        switch (cell.getCellType()) {
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case STRING:
                String value = cell.getStringCellValue().trim().toLowerCase();
                return "true".equals(value) || "yes".equals(value) || "1".equals(value) || "có".equals(value);
            case NUMERIC:
                return cell.getNumericCellValue() != 0;
            default:
                return false;
        }
    }
    
    /**
     * Tìm danh mục theo tên hoặc đường dẫn đầy đủ
     * Ví dụ: "Thức ăn" hoặc "Chó > Thức ăn"
     */
    private Category findCategoryByNameOrPath(String categoryInput) {
        if (categoryInput == null || categoryInput.trim().isEmpty()) {
            return null;
        }
        
        String input = categoryInput.trim();
        
        // Kiểm tra nếu là đường dẫn đầy đủ (chứa " > ")
        if (input.contains(" > ")) {
            return findCategoryByFullPath(input);
        }
        
        // Tìm theo tên đơn giản
        List<Category> categories = categoryRepository.findAllByNameIgnoreCase(input);
        
        if (categories.isEmpty()) {
            return null;
        }
        
        // Nếu chỉ có 1 kết quả, trả về
        if (categories.size() == 1) {
            return categories.get(0);
        }
        
        // Có nhiều danh mục cùng tên - ưu tiên danh mục lá (không có children)
        for (Category cat : categories) {
            if (cat.getChildren() == null || cat.getChildren().isEmpty()) {
                return cat;
            }
        }
        
        // Nếu không có danh mục lá, trả về null để yêu cầu dùng đường dẫn đầy đủ
        return null;
    }
    
    /**
     * Tìm danh mục theo đường dẫn đầy đủ
     * Ví dụ: "Chó > Thức ăn" hoặc "Chó > Thức ăn > Hạt"
     */
    private Category findCategoryByFullPath(String fullPath) {
        String[] parts = fullPath.split("\\s*>\\s*");
        
        if (parts.length == 0) {
            return null;
        }
        
        // Tìm danh mục gốc
        Category current = categoryRepository.findByNameIgnoreCase(parts[0].trim()).orElse(null);
        if (current == null) {
            return null;
        }
        
        // Duyệt qua các phần còn lại để tìm danh mục con
        for (int i = 1; i < parts.length; i++) {
            String childName = parts[i].trim();
            Category found = null;
            
            if (current.getChildren() != null) {
                for (Category child : current.getChildren()) {
                    if (child.getName().equalsIgnoreCase(childName)) {
                        found = child;
                        break;
                    }
                }
            }
            
            if (found == null) {
                return null;
            }
            current = found;
        }
        
        return current;
    }
}
