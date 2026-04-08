package com.petshop.service;

import com.petshop.dto.response.BusinessReportDTO;

import java.time.LocalDate;

public interface ReportingService {
    BusinessReportDTO getBusinessReport(LocalDate startDate, LocalDate endDate, Integer topLimit);

    byte[] exportBusinessReportExcel(LocalDate startDate, LocalDate endDate, Integer topLimit);

    byte[] exportBusinessReportPdf(LocalDate startDate, LocalDate endDate, Integer topLimit);
}
