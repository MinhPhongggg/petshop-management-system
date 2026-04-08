package com.petshop.service.impl;

import com.petshop.dto.response.BusinessReportDTO;
import com.petshop.repository.OrderRepository;
import com.petshop.repository.ProductVariantRepository;
import com.petshop.repository.StockMovementRepository;
import com.petshop.repository.UserRewardRepository;
import com.petshop.repository.VoucherUsageLogRepository;
import com.petshop.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingServiceImpl implements ReportingService {

    private final OrderRepository orderRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductVariantRepository productVariantRepository;
    private final VoucherUsageLogRepository voucherUsageLogRepository;
    private final UserRewardRepository userRewardRepository;

    @Override
    public BusinessReportDTO getBusinessReport(LocalDate startDate, LocalDate endDate, Integer topLimit) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        int limit = topLimit != null && topLimit > 0 ? topLimit : 10;

        BigDecimal grossRevenue = nvl(orderRepository.getGrossRevenue(start, end));
        BigDecimal totalDiscount = nvl(orderRepository.getTotalDiscount(start, end));
        BigDecimal netRevenue = nvl(orderRepository.getTotalRevenue(start, end));
        BigDecimal cogs = nvl(stockMovementRepository.getTotalCogs(start, end));
        BigDecimal grossProfit = netRevenue.subtract(cogs);
        Double marginPercent = BigDecimal.ZERO.compareTo(netRevenue) == 0
                ? 0D
                : grossProfit.divide(netRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP).doubleValue();

        BusinessReportDTO.RevenueProfitSummary revenueProfit = BusinessReportDTO.RevenueProfitSummary.builder()
                .grossRevenue(grossRevenue)
                .totalDiscount(totalDiscount)
                .netRevenue(netRevenue)
                .cogs(cogs)
                .grossProfit(grossProfit)
                .grossMarginPercent(marginPercent)
                .build();

        List<BusinessReportDTO.InventoryFlowRow> inventoryFlow = productVariantRepository.findAll().stream()
                .filter(v -> v.isActive())
                .map(v -> {
                    Integer opening = Optional.ofNullable(stockMovementRepository.getOpeningQuantity(v.getId(), start)).orElse(0);
                    Integer inQty = Optional.ofNullable(stockMovementRepository.getInQuantity(v.getId(), start, end)).orElse(0);
                    Integer outQty = Optional.ofNullable(stockMovementRepository.getOutQuantity(v.getId(), start, end)).orElse(0);
                    return BusinessReportDTO.InventoryFlowRow.builder()
                            .variantId(v.getId())
                            .productName(v.getProduct().getName())
                            .variantName(v.getName())
                            .openingQuantity(opening)
                            .inQuantity(inQty)
                            .outQuantity(outQty)
                            .closingQuantity(opening + inQty - outQty)
                            .build();
                })
                .sorted(Comparator.comparing(BusinessReportDTO.InventoryFlowRow::getProductName))
                .collect(Collectors.toList());

        List<BusinessReportDTO.TopSellingRow> topSelling = orderRepository.getTopSellingProductsByPeriod(start, end, limit).stream()
                .map(r -> BusinessReportDTO.TopSellingRow.builder()
                        .productId(((Number) r[0]).longValue())
                        .productName((String) r[1])
                        .soldQuantity(((Number) r[2]).longValue())
                        .revenue(new BigDecimal(r[3].toString()))
                        .build())
                .collect(Collectors.toList());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<BusinessReportDTO.SlowMovingRow> slowMoving = orderRepository.getSlowMovingProducts(limit).stream()
                .map(r -> BusinessReportDTO.SlowMovingRow.builder()
                        .productId(((Number) r[0]).longValue())
                        .productName((String) r[1])
                        .lastSoldAt(r[2] == null ? "Never" : r[2].toString())
                        .soldQuantity(((Number) r[3]).longValue())
                        .build())
                .collect(Collectors.toList());

        Map<Long, Long> rewardCountMap = userRewardRepository.getTopUsersByRewardUnlockCount(org.springframework.data.domain.PageRequest.of(0, limit))
                .stream().collect(Collectors.toMap(r -> ((Number) r[0]).longValue(), r -> ((Number) r[2]).longValue()));

        List<BusinessReportDTO.CustomerLoyaltyRow> loyalCustomers = orderRepository.getTopCustomersBySpend(limit).stream()
                .map(r -> {
                    Long userId = ((Number) r[0]).longValue();
                    return BusinessReportDTO.CustomerLoyaltyRow.builder()
                            .userId(userId)
                            .fullName((String) r[1])
                            .totalSpending(new BigDecimal(r[2].toString()))
                            .completedOrders(((Number) r[3]).longValue())
                            .unlockedRewardCount(rewardCountMap.getOrDefault(userId, 0L))
                            .build();
                }).collect(Collectors.toList());

        Object[] impact = voucherUsageLogRepository.getVoucherImpact(start, end);
        long usageCount = impact == null ? 0L : ((Number) impact[0]).longValue();
        BigDecimal totalDiscountAmount = impact == null ? BigDecimal.ZERO : nvl((BigDecimal) impact[1]);
        BigDecimal voucherOrderRevenue = impact == null ? BigDecimal.ZERO : nvl((BigDecimal) impact[2]);
        BigDecimal upliftPct = grossRevenue.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : voucherOrderRevenue.divide(grossRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

        BusinessReportDTO.VoucherImpact voucherImpact = BusinessReportDTO.VoucherImpact.builder()
                .usageCount(usageCount)
                .totalDiscountAmount(totalDiscountAmount)
                .voucherOrderRevenue(voucherOrderRevenue)
                .revenueUpliftPercent(upliftPct.setScale(1, RoundingMode.HALF_UP))
                .build();

        return BusinessReportDTO.builder()
                .revenueProfit(revenueProfit)
                .inventoryFlow(inventoryFlow)
                .topSellingProducts(topSelling)
                .slowMovingProducts(slowMoving)
                .loyalCustomers(loyalCustomers)
                .voucherImpact(voucherImpact)
                .build();
    }

    @Override
    public byte[] exportBusinessReportExcel(LocalDate startDate, LocalDate endDate, Integer topLimit) {
        BusinessReportDTO report = getBusinessReport(startDate, endDate, topLimit);
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet summary = workbook.createSheet("Summary");
            writeSummarySheet(summary, report);

            XSSFSheet inventory = workbook.createSheet("InventoryFlow");
            writeInventorySheet(inventory, report.getInventoryFlow());

            XSSFSheet topSelling = workbook.createSheet("TopSelling");
            writeTopSellingSheet(topSelling, report.getTopSellingProducts());

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export excel report", e);
        }
    }

    @Override
    public byte[] exportBusinessReportPdf(LocalDate startDate, LocalDate endDate, Integer topLimit) {
        BusinessReportDTO report = getBusinessReport(startDate, endDate, topLimit);
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float y = 780;
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                content.newLineAtOffset(50, y);
                content.showText("Business Report");
                content.endText();

                y -= 30;
                y = writePdfLine(content, y, "Gross Revenue: " + report.getRevenueProfit().getGrossRevenue());
                y = writePdfLine(content, y, "Net Revenue: " + report.getRevenueProfit().getNetRevenue());
                y = writePdfLine(content, y, "COGS: " + report.getRevenueProfit().getCogs());
                y = writePdfLine(content, y, "Gross Profit: " + report.getRevenueProfit().getGrossProfit());
                y = writePdfLine(content, y, "Margin %: " + report.getRevenueProfit().getGrossMarginPercent());
                y -= 10;
                y = writePdfLine(content, y, "Top Selling Products:");
                int idx = 1;
                for (BusinessReportDTO.TopSellingRow row : report.getTopSellingProducts()) {
                    y = writePdfLine(content, y, idx + ". " + row.getProductName() + " - qty " + row.getSoldQuantity());
                    idx++;
                    if (y < 60) break;
                }
            }
            document.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export pdf report", e);
        }
    }

    private float writePdfLine(PDPageContentStream content, float y, String text) throws Exception {
        content.beginText();
        content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
        content.newLineAtOffset(50, y);
        content.showText(text);
        content.endText();
        return y - 16;
    }

    private void writeSummarySheet(XSSFSheet sheet, BusinessReportDTO report) {
        int rowIdx = 0;
        Row r1 = sheet.createRow(rowIdx++);
        r1.createCell(0).setCellValue("Metric");
        r1.createCell(1).setCellValue("Value");

        rowIdx = writeSummaryRow(sheet, rowIdx, "Gross Revenue", report.getRevenueProfit().getGrossRevenue());
        rowIdx = writeSummaryRow(sheet, rowIdx, "Total Discount", report.getRevenueProfit().getTotalDiscount());
        rowIdx = writeSummaryRow(sheet, rowIdx, "Net Revenue", report.getRevenueProfit().getNetRevenue());
        rowIdx = writeSummaryRow(sheet, rowIdx, "COGS", report.getRevenueProfit().getCogs());
        rowIdx = writeSummaryRow(sheet, rowIdx, "Gross Profit", report.getRevenueProfit().getGrossProfit());
        writeSummaryRow(sheet, rowIdx, "Gross Margin %", report.getRevenueProfit().getGrossMarginPercent());
    }

    private int writeSummaryRow(XSSFSheet sheet, int rowIdx, String key, Object value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(key);
        row.createCell(1).setCellValue(value == null ? "" : value.toString());
        return rowIdx + 1;
    }

    private void writeInventorySheet(XSSFSheet sheet, List<BusinessReportDTO.InventoryFlowRow> rows) {
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Product");
        header.createCell(1).setCellValue("Variant");
        header.createCell(2).setCellValue("Opening");
        header.createCell(3).setCellValue("In");
        header.createCell(4).setCellValue("Out");
        header.createCell(5).setCellValue("Closing");

        int idx = 1;
        for (BusinessReportDTO.InventoryFlowRow r : rows) {
            Row row = sheet.createRow(idx++);
            row.createCell(0).setCellValue(r.getProductName());
            row.createCell(1).setCellValue(r.getVariantName());
            row.createCell(2).setCellValue(r.getOpeningQuantity());
            row.createCell(3).setCellValue(r.getInQuantity());
            row.createCell(4).setCellValue(r.getOutQuantity());
            row.createCell(5).setCellValue(r.getClosingQuantity());
        }
    }

    private void writeTopSellingSheet(XSSFSheet sheet, List<BusinessReportDTO.TopSellingRow> rows) {
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Product");
        header.createCell(1).setCellValue("Sold Qty");
        header.createCell(2).setCellValue("Revenue");
        int idx = 1;
        for (BusinessReportDTO.TopSellingRow r : rows) {
            Row row = sheet.createRow(idx++);
            row.createCell(0).setCellValue(r.getProductName());
            row.createCell(1).setCellValue(r.getSoldQuantity());
            row.createCell(2).setCellValue(r.getRevenue().doubleValue());
        }
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
